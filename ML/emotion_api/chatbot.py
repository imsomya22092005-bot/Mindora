import random
import re

CRISIS_PATTERNS = [
    r"\bkill(ing)? myself\b", r"\bend my life\b", r"\bend it all\b",
    r"\bwant(ed)? to die\b", r"\bwanna die\b", r"\bwish i (was|were) dead\b",
    r"\bbetter off dead\b", r"\bbetter off without me\b", r"\bsuicid(e|al)\b",
    r"\bdon'?t want to (live|be alive|exist)\b", r"\bno reason to (live|go on)\b",
    r"\bhurt(ing)? myself\b", r"\bharm myself\b", r"\bself[- ]?harm\b",
    r"\bcut(ting)? myself\b", r"\btake my own life\b", r"\bcan'?t go on\b",
    r"\bmar(na|ne|ja|jana|jaana)\b.{0,15}\bchah", r"\bmarna hai\b", r"\bmar jaun\b",
    r"\bkhud ko (khatam|maar)", r"\bjeena nahi chah", r"\bjeene ka (mann|man) nahi\b",
    r"\bkhudkushi\b", r"\baatmahatya\b",
]

def is_crisis(text):
    t = text.lower().replace("\u2019", "'")
    return any(re.search(p, t) for p in CRISIS_PATTERNS)

CRISIS_REPLY = (
    "I'm really sorry you are in so much pain, and I'm glad you told me. "
    "You deserve support from a real person right now. "
    "In India you can call Tele-MANAS at 14416 or 1-800-891-4416 (free, 24x7). "
    "If you are in immediate danger, please call 112. "
    "If you can, reach out to someone you trust and stay with them. I'm here with you too."
)
CRISIS_REMINDER = " (Support is available any time: Tele-MANAS 14416.)"
HELP_NUDGE = (" You've been carrying a lot over the last few messages. Talking to someone you trust, "
              "or a counsellor, can really help. Tele-MANAS (14416) is free and open 24x7.")
SHIFT_PREFIX = "I'm really glad to hear that. "

GROUPS = {
    "low": ["sadness", "grief", "disappointment", "remorse", "embarrassment"],
    "anxious": ["fear", "nervousness"],
    "angry": ["anger", "annoyance", "disgust", "disapproval"],
    "happy": ["joy", "excitement", "amusement", "love", "admiration", "optimism",
              "pride", "relief", "gratitude", "approval", "caring", "desire"],
    "curious": ["confusion", "curiosity", "realization", "surprise"],
    "neutral": ["neutral"],
}
EMOTION_TO_GROUP = {e: g for g, es in GROUPS.items() for e in es}
SENTIMENT_TO_GROUP = {"negative": "low", "positive": "happy", "ambiguous": "curious", "neutral": "neutral"}

# special groups come from our own rules (not from the model)
VALENCE = {"low": "negative", "anxious": "negative", "angry": "negative", "disappointed": "negative",
           "happy": "positive", "proud": "positive", "silver": "positive",
           "curious": "neutral", "neutral": "neutral"}

ACK = {
    "low": ["I'm sorry you're feeling this way.", "That sounds really heavy.",
            "It's okay to feel low sometimes, you don't have to go through it alone.",
            "I hear you, and your feelings matter."],
    "anxious": ["That sounds stressful.", "Feeling anxious is hard, and I'm glad you told me.",
                "It's okay to feel nervous.", "Worry can feel really big sometimes."],
    "angry": ["That sounds really frustrating.", "I can understand why you're upset.",
              "It's okay to feel angry.", "That sounds really annoying."],
    "happy": ["That's wonderful to hear!", "Yay, that sounds great!",
              "That's lovely, you deserve good moments like this!", "I'm so happy for you!"],
    "curious": ["Interesting!", "That's something worth thinking about.",
                "Thanks for sharing that.", "That's a good thing to wonder about."],
    "neutral": ["Thanks for sharing.", "I'm listening.", "Okay, I'm here.", "Got it."],
    "proud": ["Congratulations, that's a real achievement!",
              "That's fantastic, you should be proud of yourself!",
              "Wow, well done! All that effort paid off."],
    "disappointed": ["That sounds really disappointing, especially when you worked hard for it.",
                     "I'm sorry it didn't go the way you hoped.",
                     "It's natural to feel let down when you aimed higher."],
    "silver": ["Coming 2nd or 3rd is still a really strong result, and it's okay if you were hoping for 1st. Both feelings are valid.",
               "That's an achievement to be proud of, even if you had your heart set on the top spot. It's okay to feel a little disappointed too."],
}
QUESTIONS = {
    "low": ["Do you want to tell me what happened?", "What's been weighing on you the most?",
            "Would you like to talk about it?", "What's on your mind right now?"],
    "anxious": ["What is worrying you the most?", "What part of it feels hardest right now?",
                "Do you want to tell me what's coming up?", "What's making you feel this way?"],
    "angry": ["What happened?", "Do you want to tell me more about it?",
              "What triggered it?", "Want to vent a little? I'm here."],
    "happy": ["What made it special?", "Tell me more, I'd love to hear it.",
              "What's the best part?", "What happened?"],
    "curious": ["What's on your mind?", "What made you wonder about it?",
                "Do you want to talk it through together?", "Can you tell me a bit more?"],
    "neutral": ["How are you feeling today?", "Is there something on your mind you'd like to talk about?",
                "How has your day been so far?", "Tell me more about your day."],
    "proud": ["How are you feeling about it?", "Who did you share the news with first?",
              "What did it take to get there?"],
    "disappointed": ["What were you hoping for?", "How are you feeling about it right now?",
                     "Do you want to talk about what happened?"],
    "silver": ["How are you feeling about it right now?",
               "Which feeling is stronger at the moment, pride or disappointment?",
               "What were you hoping for?"],
}
MIXED_ACK = ["It sounds like you're feeling {a} and {b} at the same time, and that's completely okay.",
             "Feeling {a} and {b} together is more common than people think."]
MIXED_QUESTIONS = ["Do you want to tell me about the {b} part?", "Which feeling is stronger right now?"]

# more variants, so replies don't repeat quickly
ACK["low"] += ["That sounds painful, and I'm glad you told me.", "I'm here with you. Take all the time you need.",
               "It's hard to carry feelings like this.", "Thank you for trusting me with this."]
ACK["anxious"] += ["That sounds like a lot to think about.", "It makes sense that you feel on edge.",
                   "Let's slow down a little together.", "Feeling uneasy like this is really tiring."]
ACK["angry"] += ["It makes sense that you feel this way.", "That would upset a lot of people.",
                 "Your frustration is valid.", "That sounds really unfair."]
ACK["happy"] += ["That made my day, thank you for sharing!", "What a lovely thing to hear!",
                 "That's great news, you must be glowing!", "Love that for you!"]
ACK["curious"] += ["That's an interesting thought.", "Good question.", "Let's think about it together.", "Hmm, that's worth exploring."]
ACK["neutral"] += ["I see.", "Alright, I'm with you.", "Thanks for telling me.", "Okay, go on whenever you like."]
ACK["proud"] += ["You earned this, congratulations!", "That's amazing news, I'm really happy for you!"]
ACK["disappointed"] += ["That's tough, and your feelings make sense.", "It hurts when results don't match the effort we put in."]
ACK["silver"] += ["Getting that close to the top is something to be proud of, even if it stings a little."]
QUESTIONS["low"] += ["Is there something that triggered this feeling?", "How long have you been feeling like this?",
                     "What would feel a little comforting right now?"]
QUESTIONS["anxious"] += ["What is the worst part you keep thinking about?", "Is there something small that could make today easier?"]
QUESTIONS["angry"] += ["What do you wish had gone differently?", "How are you feeling in your body right now?"]
QUESTIONS["happy"] += ["How are you planning to celebrate?", "Who else knows about this?"]
QUESTIONS["curious"] += ["What do you think about it?", "Where would you like to start?"]
QUESTIONS["neutral"] += ["What's been on your mind lately?", "Is there anything you'd like to share today?"]
QUESTIONS["proud"] += ["What are you most proud of?"]
QUESTIONS["disappointed"] += ["What would help you feel a bit better right now?"]

# two extra groups for strong self-criticism and feeling overwhelmed
ACK["selfcritic"] = ["I'm sorry you're being so hard on yourself.",
                     "That sounds painful. A harsh thought like that can feel true in the moment, but it isn't the whole truth about you."]
QUESTIONS["selfcritic"] = ["What happened that made you feel this way?",
                           "If a friend said this about themselves, what would you tell them?"]
ACK["overwhelmed"] = ["That sounds like a lot to carry at once.",
                      "Feeling overwhelmed is exhausting, and it makes sense that you need a pause."]
QUESTIONS["overwhelmed"] = ["What feels like the heaviest part right now?",
                            "If we pick just one thing to look at first, what would it be?"]
VALENCE["selfcritic"] = "negative"
VALENCE["overwhelmed"] = "negative"
GROUP_EXTRA = {
    "selfcritic": " You deserve kindness, including from yourself. If these thoughts keep coming back, please talk to someone you trust or a counsellor (Tele-MANAS 14416 is free, 24x7).",
    "overwhelmed": " If it keeps feeling this heavy, a counsellor or Tele-MANAS (14416) can help share the load.",
}

TOPIC_PATTERNS = {
    "exams": r"\b(exams?|marks|results?|rank|topper|topped|percentage|grades?|semester|viva|assignments?|homework|stud(y|ies|ying)|college|school)\b",
    "work": r"\b(job|work|boss|office|interview|promotion|salary|client|deadline|project|manager|colleagues?|coworkers?)\b",
    "family": r"\b(mom|mother|mum|dad|father|parents?|family|brother|sister|home)\b",
    "friends": r"\b(friends?|bestie|best friend|roommate|classmates?)\b",
    "relationship": r"\b(boyfriend|girlfriend|partner|breakup|break up|crush|relationship|husband|wife)\b",
    "health": r"\b(sleep|sleeping|insomnia|sick|illness|health|headache|fever|unwell)\b",
    "money": r"\b(money|fees|loan|rent|broke|expenses|debt)\b",
    "loneliness": r"\b(alone|lonely|nobody|no one|isolated)\b",
}
TOPIC_NAME = {"exams": "your studies", "work": "work", "family": "your family", "friends": "your friends",
              "relationship": "your relationship", "health": "your health and sleep",
              "money": "your money worries", "loneliness": "feeling alone"}
TOPIC_ACK = {
    "exams": {"negative": ["Exams and results can put a lot of pressure on us.", "Studies can feel really stressful, and it's okay to feel that way."],
              "positive": ["Your hard work on your studies is paying off!", "Great to hear good news about your studies!"],
              "neutral": ["Studies take a lot of energy.", "College and school life can be a lot."]},
    "work": {"negative": ["Work can be really draining sometimes.", "Work pressure is hard, and it can follow us home."],
             "positive": ["Good news at work is always a lift!", "Nice, work wins deserve to be celebrated."],
             "neutral": ["Work can take up a lot of our day.", "Work life can be a lot to handle."]},
    "family": {"negative": ["Family matters can feel really heavy.", "Things with family can hurt more because they matter so much."],
               "positive": ["It's lovely when things feel good with family.", "Family moments like that are precious."],
               "neutral": ["Family is such an important part of life.", "Family can mean a lot of different things."]},
    "friends": {"negative": ["Problems with friends can really hurt.", "Friendships matter a lot, so this must feel hard."],
                "positive": ["It's wonderful to have good people around you.", "Good friends make everything better!"],
                "neutral": ["Friends are a big part of our days.", "Friendships can be complicated sometimes."]},
    "relationship": {"negative": ["Matters of the heart can hurt deeply.", "Relationships can be complicated, and it's okay to feel hurt."],
                     "positive": ["That sounds really sweet!", "It's lovely to hear things going well in your relationship."],
                     "neutral": ["Relationships can bring so many feelings.", "Matters of the heart are never simple."]},
    "health": {"negative": ["Not feeling well or not sleeping properly can make everything harder.", "Being unwell or short on sleep really affects your mood."],
               "positive": ["It's great to hear you're feeling better!", "Feeling healthy and rested is such a gift."],
               "neutral": ["Health and sleep affect so much of our day.", "Looking after your body matters too."]},
    "money": {"negative": ["Money worries can be very stressful.", "Financial stress can weigh on the mind a lot."],
              "positive": ["That's good news for your finances!", "Nice, that must feel good."],
              "neutral": ["Money matters can take a lot of thought.", "Managing money can feel like a lot."]},
    "loneliness": {"negative": ["Feeling alone can be really painful.", "Loneliness can feel heavy, and I'm glad you said it out loud."],
                   "positive": ["It's nice that you're feeling more connected.", "Connection really matters."],
                   "neutral": ["Feeling alone is something many people go through.", "Everyone needs connection sometimes."]},
}
FOLLOWUPS = ["Thanks for telling me more about {topic}. How are you feeling about it now?",
             "I see. How does it sit with you when you think about {topic}?",
             "Got it. Is there more about {topic} you'd like to share?"]

TOPIC_ACK["exams"]["negative"].append("Results can feel like they define us, but they are only one part of the story.")
TOPIC_ACK["exams"]["positive"].append("All those late nights of studying were worth it!")
TOPIC_ACK["work"]["negative"].append("It's tough when work takes more than it gives back.")
TOPIC_ACK["work"]["positive"].append("It feels great when effort at work gets noticed!")
TOPIC_ACK["family"]["negative"].append("It's hard when the people closest to us cause us pain.")
TOPIC_ACK["friends"]["negative"].append("It hurts when someone close feels distant.")
TOPIC_ACK["relationship"]["negative"].append("Heartache is real, and it takes time to heal.")
TOPIC_ACK["health"]["negative"].append("Your body and mind are connected, so it's no surprise this is affecting your mood.")
TOPIC_ACK["money"]["negative"].append("Worrying about money can make everything feel heavier.")
TOPIC_ACK["loneliness"]["negative"].append("You are not alone in feeling this way, even though it can feel like that.")
TOPIC_PATTERNS["future"] = r"\b(career|future|placements?|goals?)\b"
TOPIC_NAME["future"] = "your future"
TOPIC_ACK["future"] = {
    "negative": ["Thinking about the future can feel uncertain and scary.", "Career worries are very common, and many people feel lost at times."],
    "positive": ["It's great to feel excited about what's ahead!", "Having goals to look forward to is a good feeling."],
    "neutral": ["The future is a big thing to think about.", "Planning ahead can feel exciting and heavy at the same time."]}

def normalize(text):
    t = text.lower().replace("\u2019", "'")
    t = re.sub(r"\b(\d)\s+(st|nd|rd|th)\b", r"\1\2", t)   # "1 st" -> "1st"
    return re.sub(r"\s+", " ", t).strip()

ACHIEVE_RE = re.compile(
    r"\b(topped|topper|came (first|1st)|stood (first|1st)|first rank|1st rank|rank holder|"
    r"got (the )?(job|offer|selected|promotion|admission|distinction)|got (full|good|great) (marks|grades)|"
    r"i (have )?passed\b(?! away)|passed (the |my |an? )?(exam|exams|test|course|subject|class|semester|interview|viva|entrance|paper)|"
    r"cleared|won|promoted|got through)\b")
FAIL_RE = re.compile(
    r"\b(didn'?t|did not|don'?t|do not|couldn'?t|could not|never|not)\b.{0,25}\b"
    r"(topped|top|first|1st|rank|position|selected|pass|passed|clear|cleared|win|won|qualified|promotion|admission|distinction)\b"
    r"|\b(didn'?t|did not|couldn'?t|could not|don'?t|do not|never)\s+(get|got|receive)\b.{0,15}\b"
    r"(job|marks|rank|position|selected|admission|promotion|score|distinction|grades?|results?)\b"
    r"|\b(failed|flunked|rejected)\b")
SELF_RE = re.compile(r"\b(i am|i'?m|im|i feel like|feel like)( such)? (a |an )?(total |complete )?(failure|loser|useless|worthless|stupid|idiot|burden)\b|\bi (hate|can'?t stand) myself\b")
OVERWHELM_RE = re.compile(r"\b(overwhelmed|too much for me|can'?t handle (it|this|everything)|can'?t do this anymore|burn(t|ed) out)\b")
SILVER_RE = re.compile(r"\b(2nd|second|3rd|third|runner.?up)\b")
TOP_WORDS_RE = re.compile(r"\b(top|topper|topped|rank|position|place)\b")
CONJ_RE = re.compile(r"^(but|though|however|still|also|and)\b|\b(mixed feelings|happy and sad|sad also|also sad|both happy and sad)\b")

def rule_override(clean, state, model_valence):
    """Returns 'silver', 'disappointed', 'proud', 'mixed' or None."""
    if SILVER_RE.search(clean) and TOP_WORDS_RE.search(clean):
        return "silver"
    if FAIL_RE.search(clean):
        return "disappointed"
    if ACHIEVE_RE.search(clean):
        return "proud"
    if SELF_RE.search(clean):
        return "selfcritic"
    if OVERWHELM_RE.search(clean):
        return "overwhelmed"
    last = state["last_valence"]
    if CONJ_RE.search(clean) and last in ("positive", "negative") and model_valence in ("positive", "negative") and model_valence != last:
        return "mixed"
    return None

def find_topic(clean, state):
    for name, pattern in TOPIC_PATTERNS.items():
        if re.search(pattern, clean):
            state["topic"], state["topic_age"] = name, 0
            return name, True
    if state["topic"] and state["topic_age"] < 3:
        state["topic_age"] += 1
        return state["topic"], False
    state["topic"] = None
    return None, False

TIPS = {
    "low": ["Try writing down what you feel for 5 minutes, without judging it.",
            "Send a short message to someone you trust, even a small hello helps.",
            "Do one small kind thing for yourself: some water, a short walk, or a favourite song."],
    "anxious": ["Breathe in for 4 seconds, hold for 4, and breathe out slowly for 6. Repeat 5 times.",
                "Write the worry down, then write one small step you can take today.",
                "Look around and name 5 things you can see. It helps your mind settle in the present."],
    "angry": ["Take a short pause before replying or acting, even a few minutes helps.",
              "A brisk walk can help the tension leave your body.",
              "Write down what you want to say. You don't have to send it."],
    "happy": ["Write this moment down so you can read it on a harder day.",
              "Share the good news with someone who will enjoy it with you."],
    "general": ["Take a few slow breaths and drink some water.",
                "Break whatever feels big into one tiny step.",
                "Talk to someone you trust about how you feel."],
}
TIPS["disappointed"] = TIPS["low"]
TIPS["proud"] = TIPS["happy"]
TIPS["silver"] = TIPS["happy"]
TIPS["curious"] = TIPS["general"]
TIPS["neutral"] = TIPS["general"]
TIPS["selfcritic"] = TIPS["low"]
TIPS["overwhelmed"] = TIPS["anxious"]

INTENTS = [
    ("bye", r"^(bye|goodbye|see you|good night|gn|talk later|ttyl)( bot)?[ !.]*$",
     ["Take care! I'm here whenever you want to talk.", "Bye for now. Be kind to yourself today."]),
    ("thanks", r"^(ok )?(thanks|thank you|thankyou|thx|ty)( so much| a lot| bot| buddy)?[ !.]*$",
     ["You're welcome! I'm here whenever you need me.", "Anytime. I'm glad to listen."]),
    ("greeting", r"^(hi+|hello+|hey+|hola|namaste|yo|sup|wassup|what'?s up|good (morning|afternoon|evening))( there| bot| buddy| friend)?[ !.,]*$",
     ["Hi! I'm glad you're here. How are you feeling today?", "Hello! How is your day going?",
      "Hey there! What's on your mind today?"]),
    ("how_are_you", r"\bhow are (you|u)\b",
     ["I'm doing well, thanks for asking! I'm a bot, but I'm happy to listen. How are you feeling?"]),
    ("who_are_you", r"\b(who are you|what are you|what'?s your name|your name|are you (a )?(bot|human|real|robot|ai))\b",
     ["I'm a supportive chat bot. I try to understand how you feel and listen. I'm not a human and not a therapist."]),
    ("what_can_you_do", r"\b(what can you do|how do you work|how does this work|what do you do)\b",
     ["I can listen, notice how you might be feeling from your messages, and reply with support. "
      "I can also share a few simple tips for stress, sleep or exams. For serious problems, a real person like a counsellor is the right support."]),
    ("professional", r"\b(are you a (therapist|doctor|psychologist|counsell?or)|can you (diagnose|treat|prescribe)|replace (my )?(therapist|doctor))\b",
     ["I'm not a therapist or doctor, and I can't diagnose or treat anything. I can listen and share simple tips. "
      "If things feel heavy for a long time, please talk to a counsellor or doctor. Tele-MANAS (14416) is free and open 24x7 in India."]),
    ("privacy", r"\b(is (this|my chat) (private|safe|confidential)|privacy|confidential|who can see|do you (save|store|remember) my)\b",
     ["In this version I only keep a short summary of your recent moods (not your exact messages) during the chat. "
      "The app's privacy policy has the full details."]),
    ("define_stress", r"\bwhat is stress\b",
     ["Stress is your body and mind reacting to pressure, like exams or deadlines. A little can push us, but too much for too long is tiring. Simple breaks, sleep and talking to someone help."]),
    ("define_anxiety", r"\bwhat is anxiety\b",
     ["Anxiety is a feeling of worry or fear about what might happen. Feeling it sometimes is normal. If it is strong, constant, or stops you from living your day, please talk to a counsellor or doctor."]),
    ("define_depression", r"\bwhat is depression\b",
     ["Depression is more than a bad day. It is a low mood or loss of interest that lasts for weeks and affects daily life. It is common and treatable. If this sounds like you, please talk to a doctor or counsellor."]),
    ("exam_tips", r"\b(exam stress|stressed (about|for) (my )?exams?|how to (study|focus|concentrate)|can'?t (focus|concentrate)|study tips)\b",
     ["Exam stress is really common. A few things that may help: study in short blocks of 25 to 30 minutes with 5 minute breaks, "
      "sleep properly before the exam, make a small list of what to revise today, and talk to someone if the pressure feels too big. "
      "What is worrying you the most?"]),
    ("sleep_tips", r"\b(can'?t sleep|trouble sleeping|sleep (problem|better|issue)|insomnia)\b",
     ["Poor sleep is rough. A few things that may help: keep fixed sleep and wake times, keep your phone away for 30 minutes before bed, "
      "and avoid tea or coffee late in the day. If it goes on for weeks, please talk to a doctor."]),
    ("panic", r"\b(panic attack|anxiety attack|heart (is )?racing|can'?t breathe)\b",
     ["That sounds scary, let's slow down together. Breathe in for 4 seconds, hold for 4, and breathe out slowly for 6. "
      "Repeat a few times and name 5 things you can see. If you have chest pain or real trouble breathing, please get medical help or call 112."]),
    ("joke", r"\b(tell me a joke|say a joke|make me laugh|another joke)\b",
     ["Why did the student eat his homework? Because the teacher said it was a piece of cake!",
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my computer I needed a break, and now it won't stop sending me vacation ads."]),
    ("bored", r"^(i am |i'?m |im )?(so |really )?bored( today| right now)?[ !.]*$",
     ["Let's shake it up! You could take a short walk, play a song you love, doodle for five minutes, or message a friend. Want something calm or something energetic?"]),
    ("motivation", r"\b(motivate me|i need (some )?motivation|encourage me|cheer me up)\b",
     ["You don't have to do everything today. One small step still counts. You've handled hard days before, and you're showing up right now.",
      "Progress is not a straight line. A slow day is not a failed day. Be as kind to yourself as you would be to a friend."]),
    ("overthinking", r"\b(overthinking|over thinking|stop overthinking)\b",
     ["Overthinking is exhausting. Try this: write the thought down and ask, 'Can I do something about it today?' "
      "If yes, pick one tiny step. If not, take a few slow breaths and do something with your hands or body for 10 minutes."]),
    ("procrastination", r"\b(procrastinat\w*|can'?t start|unable to start|no motivation to (study|work))\b",
     ["Starting is the hardest part. Try the 5 minute rule: promise yourself just 5 minutes, then decide if you want to continue. "
      "Keep your phone out of reach and pick the smallest first task."]),
    ("time_management", r"\b(time management|manage (my )?time|how to plan (my )?(day|study))\b",
     ["Try this: write down 3 things that matter most today, give each a time slot, and keep short breaks between them. "
      "Do the hardest one when your energy is highest. Small plans you can finish beat big plans you can't."]),
    ("make_friends", r"\b(how (to|do i) make friends|want (to make )?friends|no friends)\b",
     ["Making friends takes time, and it's okay if it feels hard. You could join a club or study group, say hello to one person a day, "
      "or invite someone for a coffee or a walk. Do you want to tell me what makes it difficult?"]),
    ("meditation", r"\b(how to meditate|meditation|mindfulness)\b",
     ["Here is a simple start: sit comfortably, close your eyes or look at one spot, and follow your breath for 2 minutes. "
      "When your mind wanders, gently bring it back. That's the whole practice. Start small and build up."]),
    ("self_care", r"\b(self[- ]?care|take care of myself)\b",
     ["Self care can be small: sleeping on time, drinking water, eating something nourishing, a short walk, "
      "time away from your phone, and talking to someone you trust. Pick one for today."]),
    ("find_help", r"\b(find (a )?(counsell?or|therapist|doctor)|need (a )?(counsell?or|therapist)|talk to (a )?(counsell?or|professional)|where can i get help)\b",
     ["That's a good step. You can call Tele-MANAS at 14416 or 1-800-891-4416 (free, 24x7). "
      "Many colleges also have a counselling cell, and a family doctor can guide you to a mental health professional."]),
    ("affection", r"^(i love you|love you|i love u)( so much| bot| buddy)?[ !.]*$|\b(be my friend|you are my best friend)\b",
     ["That's kind of you. I'm a bot, so I can't be a friend the way a person can, but I'm glad you feel comfortable talking here. "
      "It would be good to share how you feel with someone you trust, too."]),
    ("praise", r"\b(you are (so |very )?(helpful|nice|great|kind|good)|good bot|nice bot|you helped me)\b",
     ["Thank you, that means a lot. I'm glad I could help a little."]),
    ("insult", r"\b(you are (so |very )?(stupid|useless|dumb|bad)|stupid bot|useless bot|dumb bot)\b",
     ["I'm sorry I wasn't helpful. I'm still learning. Tell me what you needed and I'll try again."]),
    ("creator", r"\bwho (made|built|created) you\b",
     ["I was built by a student team as part of a wellness app project."]),
    ("no_talk", r"\b(i don'?t want to talk|leave me alone|not in the mood)\b",
     ["That's okay. I'll be here whenever you feel like talking. Take care of yourself."]),
    ("language", r"\b(hindi|hinglish)\b",
     ["Right now I understand English best. Please write in English if you can, and I'll do my best."]),
    ("help", r"\b(help me|what should i do|(any|some|give me) (advice|tips?|suggestions?)|how (do|can) i (feel better|calm down|relax|cope|deal))\b", None),
    ("filler", r"^(ok|okay|k|hmm+|hm+|yes|yeah|yep|no|nope|nothing|idk|i don'?t know|maybe|fine|nothing much)[ !.]*$", None),
]
INTENT_RE = [(name, re.compile(p), replies) for name, p, replies in INTENTS]

def pick(state, key, options):
    """Pick an option that was not used yet (resets when all are used)."""
    used = state["used"].setdefault(key, [])
    fresh = [i for i in range(len(options)) if i not in used]
    if not fresh:
        used.clear()
        fresh = list(range(len(options)))
    choice = random.choice(fresh)
    used.append(choice)
    return options[choice]

def match_intent(clean, state):
    for name, regex, replies in INTENT_RE:
        if not regex.search(clean):
            continue
        if name == "help":
            tips = TIPS.get(state["last_group"], TIPS["general"])
            return name, "A few small things that may help: " + " ".join(
                "(%d) %s" % (i + 1, t) for i, t in enumerate(tips[:3])) + \
                " These are general ideas, not medical advice. Do you want to tell me more about what's going on?"
        if name == "filler":
            if clean.startswith("fine"):
                return name, "Sometimes 'fine' hides a lot. If you want to say more, I'm listening."
            if state["last_group"]:
                return name, pick(state, "filler_after", ["That's okay, take your time. I'm here whenever you want to continue.",
                                                          "No rush. We can keep talking, or take a quiet moment first."])
            return name, pick(state, "filler_first", ["No worries. Tell me whenever you'd like to talk.",
                                                      "That's okay. I'm here if you want to share anything."])
        return name, pick(state, "intent_" + name, replies)
    return None, None

HINGLISH_WORDS = set("""mein mujhe mujhko mera meri mere maine manne mene tum tumhe tumhara tumhari aap hum hai hain hu hoon hun
ho raha rha rahi rhi rahe lag lagta lagti lagna laga nahi nhi nahin kya kyun kyu kyuki kyunki kyunke isliye
par lekin magar aur ki ko se ka ke ek bahut bohot bhot thoda aaj kal abhi yaar bhai kuch koi sab accha acha
achha theek thik dekhi dekha dekhna kar karna kiya karu karun karta karti gaya gayi gaye dost ghar dil mann
dar darr bura udaas udas dukhi gussa khush khushi pareshan akela akeli thak namaste namaskar shukriya dhanyavaad
alvida kaise kese kaisi kaun naam neend padhai padhne bekar bekaar nikamma jaan zindagi""".split())

def is_hinglish(clean):
    words = re.findall(r"[a-z']+", clean)
    hits = sum(w in HINGLISH_WORDS for w in words)
    return hits >= 2 or (hits == 1 and len(words) <= 2)

# more Hinglish self-harm phrases for the safety check
CRISIS_PATTERNS += [
    r"\bmar ja(u|un|aun|aoon)\b", r"\bzindagi (khatam|end)\b", r"\bjeene ki (ichha|iccha|ichcha) nahi\b",
    r"\bapni jaan\b.{0,12}\b(de|le|lena|dena)\b", r"\bkhud ko (nuksan|hurt|chot)\b", r"\bsab khatam kar\b",
]
CRISIS_REPLY_HI = (
    "Mujhe bahut afsos hai ki tum itne dard mein ho, aur achha hai ki tumne mujhe bataya. "
    "Abhi tumhe kisi insaan ka saath chahiye. India mein Tele-MANAS 14416 ya 1-800-891-4416 par call karo (free, 24x7). "
    "Agar turant khatra ho to 112 par call karo. Kisi bharosemand insaan ko bata do aur unke saath raho. Main bhi yahin hu."
)
HELP_NUDGE_HI = (" Pichle kuch messages mein tum bahut kuch jhel rahe ho. Kisi bharosemand insaan ya counsellor se baat karna "
                 "madad kar sakta hai. Tele-MANAS (14416) free hai aur 24x7 khula hai.")
SHIFT_PREFIX_HI = "Ye sunke achha laga. "

# keyword -> emotion (first match wins)
HI_LEXICON = [
    (r"\b(guzar gay(a|e|i)|chal basa|nahi rahe|nahi rahi|swargwas|dehant)\b", "grief"),
    (r"\b(dar|darr|dara|dari|darta|darti|darawna|daravna)\b", "fear"),
    (r"\b(ghabra\w*|tension|chinta|fikar|fikr|nervous)\b", "nervousness"),
    (r"\b(udaas|udas|dukhi|dukh|rona|ro raha|ro rahi|ro rha|ro rhi|bura lag|dil tut\w*|akela|akeli|akelapan|mood off|mann (nahi|bhaari|kharab)|miss kar)\b", "sadness"),
    (r"\b(gussa|gusse|ghussa|naraz|naaraz)\b", "anger"),
    (r"\b(chidh|chid|bakwas|irritat\w*)\b", "annoyance"),
    (r"\b(khush|khushi|mast|badiya|badhiya|maza|majja|happy|excited)\b", "joy"),
    (r"\b(confuse\w*|samajh nahi|pata nahi kya)\b", "confusion"),
    (r"\b(galti|maafi|pachta\w*)\b", "remorse"),
]
SENT_OF_GROUP = {"low": "negative", "anxious": "negative", "angry": "negative", "happy": "positive",
                 "curious": "ambiguous", "neutral": "neutral"}

def hinglish_info(clean):
    for pattern, emotion in HI_LEXICON:
        if re.search(pattern, clean):
            if emotion == "joy" and re.search(r"\b(khush|khushi|happy|mast|maza)\b.{0,12}\b(nahi|nhi|nahin)\b", clean):
                emotion = "sadness"
            group = EMOTION_TO_GROUP[emotion]
            return {"sentiment": SENT_OF_GROUP[group], "emotion": emotion, "emotion_conf": 0.9, "top2": [emotion, "neutral"]}
    return None

SELF_HI_RE = re.compile(r"\b(main|mai|mein) (bekar|bekaar|nikamma|nikammi|useless|failure|loser) (hu|hoon|hun)\b|\bkisi kaam (ka|ki) nahi\b|\bkhud se nafrat\b")
FAIL_HI_RE = re.compile(r"\b(fail (ho|hua|hui)|nahi hua|nahi mila|nahi mili|select nahi|kam marks|kam number|number kam|bura result)\b")
ACHIEVE_HI_RE = re.compile(r"\b(top kiya|first aaya|first aayi|pass ho gay(a|i)|pass hua|select ho gay(a|i)|job lag gay(i|a)|acc?ha result|achha result|ach+he marks)\b")
OVERWHELM_HI_RE = re.compile(r"\b(thak gay(a|i|e)|thak gya|thak gyi|sambhal nahi|bahut zyada pressure|bojh)\b")
CONJ_HI_RE = re.compile(r"^(par|lekin|magar|but|phir bhi|waise|aur)\b")

def rule_override_hi(clean, state, model_valence):
    if SELF_HI_RE.search(clean):
        return "selfcritic"
    if FAIL_HI_RE.search(clean):
        return "disappointed"
    if ACHIEVE_HI_RE.search(clean):
        return "proud"
    if OVERWHELM_HI_RE.search(clean):
        return "overwhelmed"
    last = state["last_valence"]
    if CONJ_HI_RE.search(clean) and last in ("positive", "negative") and model_valence in ("positive", "negative") and model_valence != last:
        return "mixed"
    return None

ACK_HI = {
    "low": ["Ye sunke mujhe afsos hua.", "Ye sach mein bhaari lagta hai.", "Tum akele nahi ho, main yahin hu.",
            "Tumhari feelings mere liye important hain."],
    "anxious": ["Ye kaafi stressful lagta hai.", "Dar ya ghabrahat hona normal hai, main yahin hu.",
                "Thoda ruk kar dheere se saans lo, hum saath mein dekhte hain.", "Chinta kabhi kabhi bahut badi lagti hai."],
    "angry": ["Ye sach mein frustrating lagta hai.", "Tumhara gussa samajh aata hai.", "Ye toh kisi ko bhi pareshan kar dega."],
    "happy": ["Ye sunke bahut accha laga!", "Wah, ye toh badhiya baat hai!", "Mujhe bahut khushi hui sunke!"],
    "curious": ["Interesting! Aur batao.", "Ye sochne wali baat hai.", "Batane ke liye shukriya."],
    "neutral": ["Theek hai, main sun raha hu.", "Samajh gaya, aage batao.", "Okay, bolo."],
    "proud": ["Badhai ho! Ye sach mein badi baat hai.", "Wah, kamaal kar diya! Mehnat rang layi."],
    "disappointed": ["Ye sunke bura laga, khaas kar jab itni mehnat ki ho.", "Jab umeed se kam mile to dukh hona natural hai."],
    "silver": ["2nd ya 3rd aana bhi bahut badi uplabdhi hai, aur 1st ki umeed thi to thoda bura lagna bhi theek hai. Dono feelings sahi hain."],
    "overwhelmed": ["Ye ek saath bahut zyada lagta hoga.", "Thak jana swabhavik hai, thoda ruk jaana theek hai."],
    "selfcritic": ["Khud ke baare mein itni kadi baatein sochna dard deta hai, lekin wo poora sach nahi hota."],
}
QUESTIONS_HI = {
    "low": ["Kya hua, batana chaho to bata sakte ho?", "Sabse zyada kya pareshan kar raha hai?", "Is waqt mann mein kya chal raha hai?"],
    "anxious": ["Sabse zyada kis baat ki chinta hai?", "Kaun sa hissa sabse mushkil lag raha hai?", "Kya chal raha hai, batana chaho to?"],
    "angry": ["Kya hua tha?", "Thoda vent karna chaho to karo, main yahin hu.", "Kis baat se itna gussa aaya?"],
    "happy": ["Kya khaas hua?", "Aur batao, mujhe sunna hai.", "Sabse achhi baat kaun si thi?"],
    "curious": ["Aur batao, kya soch rahe ho?", "Is baare mein kya lagta hai?"],
    "neutral": ["Aaj ka din kaisa raha?", "Mann mein kuch hai to batao.", "Aaj kaisa feel ho raha hai?"],
    "proud": ["Kaisa feel ho raha hai?", "Sabse pehle kisko bataya?"],
    "disappointed": ["Tumne kya umeed ki thi?", "Abhi kaisa feel ho raha hai?"],
    "silver": ["Abhi kaisa feel ho raha hai?", "Kaun si feeling zyada hai, garv ya nirasha?"],
    "overwhelmed": ["Sabse bhaari cheez kaun si lag rahi hai?", "Agar ek hi cheez dekhni ho to kaun si hogi?"],
    "selfcritic": ["Aisa kya hua jisse ye feel hua?", "Agar tumhara dost aisa kehta to tum usse kya kehte?"],
}
MIXED_ACK_HI = ["Lagta hai tumhe ek saath {a} aur {b} feel ho raha hai, aur ye bilkul theek hai.",
                "{a} aur {b} ek saath mehsoos karna utna rare nahi jitna log sochte hain."]
MIXED_Q_HI = ["{b} wale hisse ke baare mein batana chaho to?", "Abhi kaun si feeling zyada hai?"]
EMO_HI = {"joy": "khushi", "sadness": "udaasi", "fear": "dar", "anger": "gussa", "nervousness": "ghabrahat",
          "excitement": "josh", "love": "pyaar", "disappointment": "nirasha", "relief": "raahat",
          "grief": "gham", "annoyance": "chidh", "confusion": "uljhan", "remorse": "pachtawa"}
GROUP_EXTRA_HI = {
    "selfcritic": " Tum pyaar aur narmi ke haqdaar ho, khud se bhi. Agar ye khayal baar baar aayein to kisi bharosemand insaan ya counsellor se baat karo (Tele-MANAS 14416, free, 24x7).",
    "overwhelmed": " Agar ye bojh bana rahe to counsellor ya Tele-MANAS (14416) se baat karna madad kar sakta hai.",
}
TOPIC_ACK_HI = {
    "exams": {"negative": ["Padhai aur results ka pressure bahut hota hai.", "Exam ka tension sach mein thaka dene wala hota hai."],
              "positive": ["Tumhari mehnat rang la rahi hai!", "Padhai ki achhi khabar sunke accha laga!"]},
    "work": {"negative": ["Kaam ka pressure kabhi kabhi bahut thaka deta hai."], "positive": ["Kaam mein achhi khabar hamesha achhi lagti hai!"]},
    "family": {"negative": ["Ghar ki baatein dil par zyada lagti hain, kyunki apne hote hain."], "positive": ["Ghar mein achha mahaul ho to sab accha lagta hai."]},
    "friends": {"negative": ["Dosto ke saath problem dukh deti hai."], "positive": ["Achhe dost mile to sab accha lagta hai!"]},
    "relationship": {"negative": ["Dil ki baatein gehra dard deti hain."], "positive": ["Ye sunke bahut accha laga!"]},
    "health": {"negative": ["Tabiyat ya neend theek na ho to sab mushkil lagta hai."], "positive": ["Tabiyat achhi ho rahi hai, ye achhi baat hai!"]},
    "money": {"negative": ["Paison ki chinta bahut bhaari hoti hai."], "positive": ["Paison ki achhi khabar sunke accha laga!"]},
    "loneliness": {"negative": ["Akelapan bahut dukh deta hai, aur tumne bataya, ye achha hai."], "positive": ["Achha laga ki ab tum jude hue mehsoos kar rahe ho."]},
    "future": {"negative": ["Future ke baare mein sochna kabhi kabhi dara deta hai."], "positive": ["Aage ke liye excited hona achhi baat hai!"]},
    "scary": {"negative": ["Darawni cheezein dekhne ke baad dar lagna bilkul normal hai, ye kuch der tak saath reh sakta hai."]},
}
REASON_RE = re.compile(r"^(because|cause|cuz|coz|kyuki|kyunki|kyunke|isliye|vajah|wajah)\b")
REASON_Q = ["How are you feeling about it now?", "Is there something that would make it feel a little lighter?"]
REASON_Q_HI = ["Ab kaisa feel ho raha hai?", "Kya cheez tumhe thoda halka feel karwa sakti hai?"]

HI_TIPS = {
    "low": ["5 minute ke liye apni feelings likh do, bina judge kiye.",
            "Kisi bharosemand insaan ko ek chhota sa message bhej do.",
            "Apne liye ek chhota kaam karo: paani piyo, thodi der tehlo, ya pasandida gaana suno."],
    "anxious": ["Naak se 4 second saans lo, 4 second roko, aur 6 second mein dheere se chhodo. 5 baar dohrao.",
                "Chinta ko likh do aur uske liye ek chhota kadam socho.",
                "Aas-paas ki 5 cheezein dekho aur unke naam lo. Isse mann abhi mein aa jata hai."],
    "angry": ["Jawab dene se pehle kuch minute ruk jao.", "Thodi tez walk gusse ki garmi nikaal deti hai.",
              "Jo kehna hai wo likh lo, bhejna zaroori nahi."],
    "happy": ["Is pal ko likh lo, mushkil din mein padhne ke kaam aayega.", "Ye khushkhabri kisi apne ke saath share karo."],
    "general": ["Kuch dheeri saansein lo aur paani piyo.", "Bade kaam ko ek chhote kadam mein todo.",
                "Kisi bharosemand insaan se baat karo."],
}
for g, src in [("disappointed", "low"), ("selfcritic", "low"), ("overwhelmed", "anxious"), ("proud", "happy"),
               ("silver", "happy"), ("curious", "general"), ("neutral", "general")]:
    HI_TIPS[g] = HI_TIPS[src]

HI_INTENTS = [
    ("how_are_you", r"\b(kaise ho|kese ho|kaisi ho|kaise hain|kya haal)\b",
     ["Main theek hu, poochne ke liye shukriya! Main ek bot hu, par sunne ke liye taiyaar hu. Tum batao, kaisa feel ho raha hai?"]),
    ("greeting", r"^(namaste|namaskar|hello ji|hi ji)( yaar| bot| dost)?[ ?!.]*$",
     ["Namaste! Main yahin hu. Aaj kaisa feel ho raha hai?"]),
    ("who_are_you", r"\b(tum kaun ho|aap kaun hain|tumhara naam|apna naam|tum kya ho|tum bot ho)\b",
     ["Main ek supportive chat bot hu. Tumhari baat sunne aur samajhne ki koshish karta hu. Main insaan nahi hu aur therapist bhi nahi."]),
    ("thanks", r"^(shukriya|dhanyavaad|thanks yaar|thank you yaar|thanku)( bot| dost)?[ !.]*$",
     ["Koi baat nahi! Jab bhi baat karni ho, main yahin hu."]),
    ("bye", r"^(alvida|chalo bye|bye yaar|phir milte hain|good night yaar|shubh ratri)[ !.]*$",
     ["Apna dhyan rakhna. Jab bhi baat karni ho, main yahin hu."]),
    ("sleep_tips", r"\b(neend nahi|neend nhi|so nahi pa|sone mein dikkat)\b",
     ["Neend na aana pareshan karta hai. Roz same time par sone ki koshish karo, sone se 30 minute pehle phone door rakho, "
      "aur raat ko chai ya coffee se bacho. Agar ye hafton tak chale to doctor se baat karo."]),
    ("study_tips", r"\b(padhai mein mann nahi|padhne mein mann nahi|focus nahi|dhyan nahi lag|concentrate nahi)\b",
     ["Padhai mein mann na lage to 25 minute padho aur 5 minute ka break lo. Phone door rakho aur aaj ka sirf ek chhota target banao. "
      "Kya cheez sabse zyada pareshan kar rahi hai?"]),
    ("help", r"\b(kya karu|kya karun|kya karoon|help karo|madad karo|mujhe help chahiye|koi tip|kuch tips|kuch batao)\b", None),
]
HI_INTENT_RE = [(n, re.compile(p), r) for n, p, r in HI_INTENTS]

def match_intent_hi(clean, state):
    for name, regex, replies in HI_INTENT_RE:
        if not regex.search(clean):
            continue
        if name == "help":
            tips = HI_TIPS.get(state["last_group"], HI_TIPS["general"])
            return name, "Kuch chhoti baatein jo madad kar sakti hain: " + " ".join(
                "(%d) %s" % (i + 1, t) for i, t in enumerate(tips[:3])) + \
                " Ye general sujhav hain, medical salah nahi. Kya chal raha hai, thoda aur batana chaho to?"
        return name, pick(state, "hi_intent_" + name, replies)
    return None, None

GRIEF_ACK = ["I'm so sorry for your loss. Grief can feel overwhelming.",
             "I'm so sorry. Losing someone leaves a very big gap."]
GRIEF_ACK_HI = ["Mujhe tumhare nuksan ke baare mein sunke bahut dukh hua.",
                "Bahut afsos hai. Kisi apne ko khona bahut bada khaalipan chhod jaata hai."]

# the scary topic (used for both English and Hinglish)
TOPIC_PATTERNS["scary"] = r"\b(horror|scary|ghost|bhoot|nightmare|horrif\w*|terrif\w*|frighten\w*|darawni|darawna)\b"
TOPIC_NAME["scary"] = "the scary movie"
TOPIC_ACK["scary"] = {
    "negative": ["Scary movies can stay with us even after they end. It's okay to feel shaken.",
                 "Being scared after something frightening is completely normal."],
    "positive": ["Sounds like a fun thrill!"], "neutral": ["Scary stories can be thrilling and unsettling at once."]}
TIPS_SCARY = ["Turn on a light and sit somewhere comfortable.", "Watch something light-hearted or listen to calm music.",
              "Take slow breaths, and talk to a friend if you can."]

MAX_HISTORY = 10

def new_state():
    return {"history": [], "used": {}, "help_at": -10, "crisis_turns": 0, "turn": 0,
            "last_group": None, "last_emotion": None, "last_valence": None,
            "topic": None, "topic_age": 0, "topic_acked": None}

def remember(state, sentiment, emotion):
    state["history"].append({"sentiment": sentiment, "emotion": emotion})  # message text is NOT stored
    del state["history"][:-MAX_HISTORY]

def finish(state, reply, hi=False):
    if state["crisis_turns"] > 0:
        lead = "Main abhi bhi yahin hu. " if hi else "I'm still here with you. "
        reply = lead + reply + CRISIS_REMINDER
        state["crisis_turns"] -= 1
    return reply

def pick_text(state, key, en_options, hi_options, hi):
    if hi and hi_options:
        return pick(state, "hi_" + key, hi_options)
    return pick(state, key, en_options)

def chat(text, state, analyze_fn, conf_limit=0.30):
    # Returns {"reply", "analysis" (or None), "crisis", "intent" (or None), "group" (or None)}
    turn = state["turn"]
    state["turn"] += 1
    clean = normalize(text)
    hi = is_hinglish(clean)

    # 1) safety first
    if is_crisis(text):
        state["crisis_turns"] = 3
        remember(state, "negative", "crisis")
        return {"reply": CRISIS_REPLY_HI if hi else CRISIS_REPLY, "analysis": None, "crisis": True,
                "intent": None, "group": None}

    # 2) FAQ / small talk (no model needed)
    intent, reply = match_intent_hi(clean, state) if hi else (None, None)
    if not intent:
        intent, reply = match_intent(clean, state)
    if intent:
        return {"reply": finish(state, reply, hi), "analysis": None, "crisis": False, "intent": intent, "group": None}

    # 3) understand the feeling: Hinglish keywords, or the English model
    source = "model"
    info = None
    if hi:
        info = hinglish_info(clean)
        source = "hinglish_rules"
        if info is None:
            guess = analyze_fn(text)               # the model is weak on Hinglish: trust it only if very sure
            if guess["emotion_conf"] >= 0.8:
                info, source = guess, "model"
            else:
                info = {"sentiment": "neutral", "emotion": "neutral", "emotion_conf": 0.0, "top2": ["neutral", "neutral"]}
                source = "fallback"
    else:
        info = analyze_fn(text)
    confident = info["emotion_conf"] >= conf_limit
    model_group = EMOTION_TO_GROUP[info["emotion"]] if confident else SENTIMENT_TO_GROUP[info["sentiment"]]

    # 4) our rules can override the model, then context (topic, previous mood)
    topic, topic_is_new = find_topic(clean, state)
    rule_group = rule_override(clean, state, VALENCE[model_group])
    if rule_group is None and hi:
        rule_group = rule_override_hi(clean, state, VALENCE[model_group])
    reason = rule_group is None and state["last_group"] is not None and REASON_RE.match(clean) is not None
    group = state["last_group"] if reason else (rule_group or model_group)
    short = len(clean.split()) <= 6
    followup = (rule_group is None and not reason and model_group in ("neutral", "curious") and short
                and state["last_group"] in ("low", "anxious", "angry", "happy", "disappointed", "proud", "silver",
                                            "selfcritic", "overwhelmed")
                and topic is not None)

    # 5) build the reply
    valence = VALENCE.get(group, "neutral")
    en_lines = hi_lines = None
    if topic and rule_group is None and topic != state["topic_acked"]:
        en_lines = TOPIC_ACK[topic].get(valence)
        hi_lines = TOPIC_ACK_HI.get(topic, {}).get(valence)
    topic_lines = en_lines
    if group == "mixed":
        a = state["last_emotion"] or "one feeling"
        b = info["emotion"] if confident else "another feeling"
        if hi:
            a, b = EMO_HI.get(a, a), EMO_HI.get(b, b)
        first = pick_text(state, "mixed_ack", MIXED_ACK, MIXED_ACK_HI, hi).format(a=a, b=b)
        second = pick_text(state, "mixed_q", MIXED_QUESTIONS, MIXED_Q_HI, hi).format(b=b)
        reply = first[0].upper() + first[1:] + " " + second[0].upper() + second[1:]
    elif reason:
        lead = "Batane ke liye shukriya. " if hi else "Thanks for telling me why. "
        extra = (pick_text(state, "topic_" + topic + valence, en_lines, hi_lines, hi) + " ") if topic_lines else ""
        if topic_lines:
            state["topic_acked"] = topic
        reply = lead + extra + pick_text(state, "reason_q", REASON_Q, REASON_Q_HI, hi)
    elif followup:
        reply = pick(state, "followup", FOLLOWUPS).format(topic=TOPIC_NAME[topic])
    else:
        if group == "low" and confident and info["emotion"] == "grief":
            ack = pick_text(state, "grief_ack", GRIEF_ACK, GRIEF_ACK_HI, hi)   # loss: condolence, not a topic line
        elif topic_lines:
            ack = pick_text(state, "topic_" + topic + valence, en_lines, hi_lines, hi)
            state["topic_acked"] = topic
        else:
            ack = pick_text(state, "ack_" + group, ACK[group], ACK_HI.get(group), hi)
        reply = ack + " " + pick_text(state, "q_" + group, QUESTIONS[group], QUESTIONS_HI.get(group), hi)

    reply += (GROUP_EXTRA_HI if hi else GROUP_EXTRA).get(group, "")

    # 6) remember, then context extras
    sentiment = {"negative": "negative", "positive": "positive"}.get(VALENCE.get(group), info["sentiment"]) \
        if rule_group else info["sentiment"]
    remember(state, sentiment, info["emotion"])
    prev_valence = state["last_valence"]
    if not reason:
        state["last_group"] = model_group if group == "mixed" else group
        state["last_emotion"] = info["emotion"]
        state["last_valence"] = VALENCE.get(state["last_group"])

    last3 = [h["sentiment"] for h in state["history"][-3:]]
    if len(last3) == 3 and all(s == "negative" for s in last3) and turn - state["help_at"] >= 5:
        reply += HELP_NUDGE_HI if hi else HELP_NUDGE
        state["help_at"] = turn
    elif state["crisis_turns"] == 0 and prev_valence == "negative" and group == "happy":
        reply = (SHIFT_PREFIX_HI if hi else SHIFT_PREFIX) + reply

    analysis = {"sentiment": info["sentiment"], "emotion": info["emotion"], "confidence": round(info["emotion_conf"], 4),
                "top2": info["top2"], "confident": confident, "source": source}
    return {"reply": finish(state, reply, hi), "analysis": analysis, "crisis": False, "intent": None, "group": group}