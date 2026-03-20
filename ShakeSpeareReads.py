# Prints dialogue from A Midsummer Night's Dream word by word,
# simulating real-time speech with a short delay between each word.

import time
import sys

dialogue = [
    ("THESEUS", "Now, fair Hippolyta, our nuptial hour draws on apace."),
    ("HIPPOLYTA", "Four days will quickly steep themselves in night; four nights will quickly dream away the time."),
    ("THESEUS", "Go, Philostrate, stir up the Athenian youth to merriments; awake the pert and nimble spirit of mirth."),
    ("EGEUS", "Happy be Theseus, our renowned duke!"),
    ("THESEUS", "Thanks, good Egeus. What's the news with thee?"),
    ("EGEUS", "Full of vexation come I, with complaint against my child, my daughter Hermia."),
    ("HERMIA", "I would my father look'd but with my eyes."),
    ("THESEUS", "Rather your eyes must with his judgment look."),
    ("LYSANDER", "The course of true love never did run smooth."),
    ("HELENA", "How happy some o'er other some can be! Through Athens I am thought as fair as she."),
    ("PUCK", "I am that merry wanderer of the night. I jest to Oberon and make him smile."),
    ("OBERON", "I know a bank where the wild thyme blows, where oxlips and the nodding violet grows."),
    ("TITANIA", "These are the forgeries of jealousy: and never, since the middle summer's spring, met we on hill, in dale, forest or mead."),
    ("BOTTOM", "I will roar you as gently as any sucking dove; I will roar you an 'twere any nightingale."),
    ("PUCK", "Lord, what fools these mortals be!"),
]

# Average speech ~140 wpm. At 75% of real-time: 0.1s per character.
CHAR_DELAY = 0.1

def print_dialogue(character, line):
    # Print character name in a simple bracket format
    sys.stdout.write(f"\n[{character}]  ")
    sys.stdout.flush()
    time.sleep(0.5)
    for char in line:
        sys.stdout.write(char)
        sys.stdout.flush()
        # Slight extra pause on punctuation to mimic natural speech rhythm
        if char in ".,;:!?":
            time.sleep(CHAR_DELAY * 4)
        else:
            time.sleep(CHAR_DELAY)
    sys.stdout.write("\n")
    time.sleep(0.8)  # pause between speakers

print("\n=== A Midsummer Night's Dream ===\n")
time.sleep(0.8)

for character, line in dialogue:
    print_dialogue(character, line)

print("\n=== End of Excerpt ===\n")
