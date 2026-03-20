# A Midsummer Night's Dream — RSC-style theatrical voices mixed with horse neighs.
# Uses macOS 'say' with British neural voices (Daniel/Serena) at a slow, deliberate pace.

import math
import os
import random
import struct
import subprocess
import tempfile
import wave

SAMPLE_RATE = 44100
TMPDIR = tempfile.mkdtemp()

# RSC-style: slow and deliberate (~130 wpm). Default macOS say rate is ~200 wpm.
MALE_VOICE   = "Daniel"   # British male neural voice
FEMALE_VOICE = "Serena"   # British female neural voice
FEMALE_CHARACTERS = {"HIPPOLYTA", "HERMIA", "HELENA", "TITANIA"}
SPEECH_RATE = 130         # words per minute

# (character, line, neigh_duration, base_freq, pitch_rise)
dialogue = [
    ("THESEUS",
     "Now, fair Hippolyta, our nuptial hour draws on apace.",
     1.2, 350, 400),

    ("HIPPOLYTA",
     "Four days will quickly steep themselves in night, four nights will quickly dream away the time.",
     1.8, 500, 300),

    ("THESEUS",
     "Go, Philostrate, stir up the Athenian youth to merriments, awake the pert and nimble spirit of mirth.",
     1.0, 400, 700),

    ("EGEUS",
     "Full of vexation come I, with complaint against my child, my daughter Hermia.",
     1.4, 300, 900),

    ("THESEUS",
     "Thanks, good Egeus. What's the news with thee?",
     0.9, 380, 400),

    ("EGEUS",
     "Happy be Theseus, our renowned duke!",
     0.8, 320, 800),

    ("HERMIA",
     "I would my father look'd but with my eyes.",
     1.5, 600, 200),

    ("THESEUS",
     "Rather your eyes must with his judgment look.",
     1.0, 330, 350),

    ("LYSANDER",
     "The course of true love never did run smooth.",
     1.2, 420, 300),

    ("HELENA",
     "How happy some o'er other some can be! Through Athens I am thought as fair as she.",
     1.6, 550, 250),

    ("PUCK",
     "I am that merry wanderer of the night. I jest to Oberon and make him smile.",
     0.7, 700, 600),

    ("OBERON",
     "I know a bank where the wild thyme blows, where oxlips and the nodding violet grows.",
     2.0, 280, 150),

    ("TITANIA",
     "These are the forgeries of jealousy, and never since the middle summer's spring met we on hill, in dale, forest or mead.",
     1.8, 520, 500),

    ("BOTTOM",
     "I will roar you as gently as any sucking dove, I will roar you as 'twere any nightingale.",
     1.3, 260, 800),

    ("PUCK",
     "Lord, what fools these mortals be!",
     0.6, 800, 700),
]

# --- Horse neigh synthesis ---

def synthesise_neigh(duration, base_freq, pitch_rise, seed=42):
    random.seed(seed)
    n_samples = int(duration * SAMPLE_RATE)
    frames = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        progress = t / duration
        freq = (base_freq + pitch_rise * progress) * (1.0 + 0.03 * math.sin(2 * math.pi * 8 * t))
        sample = (
            0.50 * math.sin(2 * math.pi * freq * t) +
            0.25 * math.sin(2 * math.pi * 2 * freq * t) +
            0.12 * math.sin(2 * math.pi * 3 * freq * t) +
            0.06 * math.sin(2 * math.pi * 4 * freq * t) +
            0.07 * (random.random() - 0.5)
        )
        attack  = min(t / 0.06, 1.0)
        release = max(0.0, 1.0 - (progress - 0.75) / 0.25) if progress > 0.75 else 1.0
        frames.append(struct.pack('<h', int(sample * attack * release * 28000)))
    return b''.join(frames)

# --- Audio mixing ---

def read_wav_mono(path):
    with wave.open(path, 'rb') as w:
        params  = w.getparams()
        n       = w.getnframes()
        raw     = w.readframes(n)
    ch = params.nchannels
    total_samples = len(raw) // (params.sampwidth * ch)
    fmt = f'<{total_samples * ch}h'
    all_samples = struct.unpack(fmt, raw)
    # Downmix to mono if stereo
    if ch == 2:
        mono = [(all_samples[i] + all_samples[i+1]) // 2 for i in range(0, len(all_samples), 2)]
    else:
        mono = list(all_samples)
    return params, mono

def mix_and_save(voice_wav, neigh_wav, out_path, voice_vol=0.65, neigh_vol=0.35):
    params_v, samples_v = read_wav_mono(voice_wav)
    _,        samples_n = read_wav_mono(neigh_wav)
    length = max(len(samples_v), len(samples_n))
    samples_v += [0] * (length - len(samples_v))
    samples_n += [0] * (length - len(samples_n))
    mixed = [max(-32768, min(32767, int(v * voice_vol + h * neigh_vol)))
             for v, h in zip(samples_v, samples_n)]
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(struct.pack(f'<{length}h', *mixed))

# --- Main ---

print("\n=== A Midsummer Night's Dream (RSC × Horse) ===\n")

for idx, (character, line, dur, freq, rise) in enumerate(dialogue):
    print(f"[{character}]  {line}")

    voice = FEMALE_VOICE if character in FEMALE_CHARACTERS else MALE_VOICE

    # 1. Synthesise speech via macOS say → AIFF → WAV
    aiff_path = os.path.join(TMPDIR, f"{idx:02d}_voice.aiff")
    wav_voice  = os.path.join(TMPDIR, f"{idx:02d}_voice.wav")
    subprocess.run(["say", "-v", voice, "-r", str(SPEECH_RATE), "-o", aiff_path, line],
                   check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@44100", "-c", "1",
                    aiff_path, wav_voice],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 2. Synthesise neigh
    wav_neigh = os.path.join(TMPDIR, f"{idx:02d}_neigh.wav")
    with wave.open(wav_neigh, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(synthesise_neigh(dur, freq, rise, seed=idx))

    # 3. Mix and play
    wav_mixed = os.path.join(TMPDIR, f"{idx:02d}_mixed.wav")
    mix_and_save(wav_voice, wav_neigh, wav_mixed)
    subprocess.run(["afplay", wav_mixed])

    for f in [aiff_path, wav_voice, wav_neigh, wav_mixed]:
        os.unlink(f)

print("\n=== End of Excerpt ===\n")
