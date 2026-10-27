"""
rule_extras.py - rule_chatbot.py (tumhara original rule-based bot) me aur bahut saare replies jodta hai.

Original file ko chhua nahi gaya. Ye file import hote hi uske reply pools (ACK, QUESTIONS, TOPIC_ACK, jokes, ...)
me naye variants jodti hai aur naye intents (breathing exercise, anger control, confidence, hug, fun fact, ...) add karti hai.
Naye intents ke regex jaanbujhkar tight rakhe hain, taaki normal emotional messages hijack na hon.
"""
import re

import rule_chatbot as rc


def _extend(target, items):
    """Duplicate bachakar list me jodo."""
    for it in items:
        if it not in target:
            target.append(it)


def _extend_map(target, extra):
    for key, items in extra.items():
        _extend(target.setdefault(key, []), items)


# ===================================================================== English: feeling pools
ACK_EN = {
    "low": [
        "I'm really sorry, that sounds painful.",
        "That sounds like a heavy day, and I'm glad you said it out loud.",
        "It makes sense that you feel this way.",
        "Thank you for trusting me with this.",
        "Low days are hard, and you don't have to pretend to be okay here.",
        "That sounds exhausting, both for your heart and your mind.",
    ],
    "anxious": [
        "That sounds really nerve-wracking.",
        "Worry can make everything feel louder, and I understand.",
        "It's okay to feel scared, even when others can't see it.",
        "Feeling on edge like this is tiring, and you're not alone in it.",
        "Thanks for telling me, naming the worry is already a small step.",
        "I can imagine how restless that must feel.",
    ],
    "angry": [
        "I can hear how frustrated you are.",
        "That would upset a lot of people.",
        "Your anger makes sense, something clearly crossed a line for you.",
        "That sounds really unfair.",
        "It's okay to be furious, feelings like this need somewhere to go.",
        "I'm sorry you had to deal with that.",
    ],
    "happy": [
        "That's such good news, I'm smiling for you!",
        "Aww, that made my day too!",
        "You sound really happy, and I love that.",
        "That's a great feeling, hold on to it!",
        "Wonderful! You deserve moments like this.",
        "That's so nice to hear!",
    ],
    "curious": [
        "That's a thoughtful thing to wonder about.",
        "Good question, let's think about it together.",
        "I like that you're curious about this.",
        "That's a fair thing to be unsure about.",
        "Interesting, thanks for bringing it up.",
        "Hmm, that's worth exploring.",
    ],
    "neutral": [
        "I'm here and I'm listening.",
        "Okay, thanks for letting me know.",
        "Take your time, there's no hurry here.",
        "Got it.",
        "Alright, I'm with you.",
        "That's okay, we can go at your pace.",
    ],
    "proud": [
        "Amazing work, you really earned this!",
        "That's so impressive, congratulations!",
        "Your effort clearly paid off, well done!",
        "What a win, I'm so happy for you!",
        "You should be really proud of yourself!",
    ],
    "disappointed": [
        "That's a tough result to take after all your effort.",
        "It's okay to feel let down, you cared about this.",
        "I'm sorry, that must sting right now.",
        "One result doesn't say everything about you, but I know it hurts today.",
        "Wanting something badly and missing it is painful.",
    ],
    "silver": [
        "Being that close to the top is a real achievement.",
        "You did really well, even if you hoped for more.",
        "Second or third place still took a lot of work, and it shows.",
    ],
    "selfcritic": [
        "I'm sorry you're talking to yourself this harshly.",
        "That sounds like a very heavy thing to believe about yourself.",
        "Thoughts like that feel true, but feelings aren't always facts.",
    ],
    "overwhelmed": [
        "That's a lot on your plate, no wonder you feel stretched.",
        "When everything piles up, even small things feel huge.",
        "It makes sense that you need a breather.",
    ],
}

QUESTIONS_EN = {
    "low": [
        "What's been the hardest part today?",
        "Is this something that just happened, or has it been building up?",
        "What would feel even a little bit comforting right now?",
        "Do you want to vent, or would you like some ideas to feel lighter?",
        "Is there someone you feel safe talking to about this?",
        "How long have you been feeling like this?",
    ],
    "anxious": [
        "What is your mind telling you might happen?",
        "Is this worry about something coming up soon?",
        "What usually helps you feel a little calmer?",
        "On a scale of 1 to 10, how strong is the worry right now?",
        "Do you want to talk it through, or try a quick calming exercise?",
        "When did you first notice this feeling today?",
    ],
    "angry": [
        "What happened right before you felt this way?",
        "Is it about one person or a mix of things?",
        "What do you wish had gone differently?",
        "Do you want to vent about it? I'm listening.",
        "What would help you cool down a little right now?",
        "How is your body feeling at the moment, tense or restless?",
    ],
    "happy": [
        "What was the best part?",
        "Who would you like to share this with?",
        "How did you celebrate, or how do you want to?",
        "What made today go so well?",
        "How long have you been waiting for this?",
        "Tell me everything!",
    ],
    "curious": [
        "What got you thinking about this?",
        "What are you hoping to understand?",
        "Is there a particular part you're stuck on?",
        "What do you think so far?",
        "Would you like some ideas or just to think out loud?",
        "Where would you like to start?",
    ],
    "neutral": [
        "Anything on your mind that you'd like to share?",
        "How has your day been so far?",
        "How did you sleep last night?",
        "Is there something you've been thinking about lately?",
        "What would make today a bit better?",
        "Would you like to talk, or would a few tips help more?",
    ],
    "proud": [
        "What was the toughest part of getting here?",
        "What are you planning to do to celebrate?",
        "What's next on your list?",
    ],
    "disappointed": [
        "What part hurts the most?",
        "What would you like to do next, even a small step?",
        "Do you want to talk about what you learned, or just how you feel?",
    ],
    "silver": [
        "What are you most proud of from this journey?",
        "What would you do differently, or are you at peace with it?",
        "Who has been supporting you through this?",
    ],
    "selfcritic": [
        "What triggered this thought today?",
        "What would a kind friend say to you right now?",
        "Has anything good happened recently that this thought ignores?",
    ],
    "overwhelmed": [
        "What's one thing that could wait until tomorrow?",
        "What's the smallest step you could take right now?",
        "Is there anyone who could take a bit off your plate?",
    ],
}

TOPIC_ACK_EN = {
    "exams": {
        "negative": ["Exam pressure can make even a strong student doubt themselves.",
                     "Studying under pressure is draining, and your feelings are valid."],
        "positive": ["Your preparation is showing, that's great news!", "Good results after all that effort, so happy for you!"],
        "neutral": ["Exam season keeps the mind busy all the time.", "Studies can feel like a marathon sometimes."],
    },
    "work": {
        "negative": ["Work stress can follow you home, and that's tiring.", "Pressure at work can be really draining."],
        "positive": ["Good things at work feel great, congratulations!", "Nice, that must feel rewarding!"],
        "neutral": ["Work can take up a lot of mental space.", "A lot goes on at work, doesn't it?"],
    },
    "family": {
        "negative": ["Family situations can be hard because they matter so much to us.", "Tension at home can weigh on everything else."],
        "positive": ["Lovely, good family moments are precious!", "That's heartwarming to hear about your family."],
        "neutral": ["Family is a big part of life, with all its ups and downs.", "Home life can be complicated at times."],
    },
    "friends": {
        "negative": ["Trouble with friends hurts because they matter to us.", "Friendship problems can be really painful."],
        "positive": ["Good friends make everything better, that's lovely!", "It's wonderful to have people like that."],
        "neutral": ["Friendships can have all kinds of moods.", "Friends shape so much of how our days feel."],
    },
    "relationship": {
        "negative": ["Relationship troubles can be really confusing and painful.", "Matters of the heart can hurt a lot."],
        "positive": ["That's sweet, happy things in a relationship are special!", "Aww, that sounds lovely."],
        "neutral": ["Relationships have many layers.", "Matters of the heart are rarely simple."],
    },
    "health": {
        "negative": ["Not feeling well in body or sleep affects everything, I'm sorry.", "Health worries can be really stressful."],
        "positive": ["Feeling better is such a relief, great to hear!", "Taking care of your health is paying off!"],
        "neutral": ["Health and sleep shape our mood a lot.", "Our body and mind are closely linked."],
    },
    "money": {
        "negative": ["Money worries can be really stressful, I understand.", "Financial pressure is heavy to carry."],
        "positive": ["Good news about money brings real relief!", "That must ease a lot of stress, great!"],
        "neutral": ["Money matters can sit in the back of our mind.", "Finances can be tricky to think about."],
    },
    "loneliness": {
        "negative": ["Feeling alone can hurt, and I'm glad you told me.", "Loneliness is more common than people admit, and it's hard."],
        "positive": ["It's lovely that you're feeling more connected!", "Feeling less alone is a real gift."],
        "neutral": ["Sometimes company and solitude both feel complicated.", "Being alone can mean many different things."],
    },
    "future": {
        "negative": ["Worrying about the future is exhausting, especially with so many unknowns.", "Uncertainty about what's next is really hard."],
        "positive": ["Looking forward to the future feels great, that's wonderful!", "Hope for what's ahead is a lovely feeling."],
        "neutral": ["The future can feel both exciting and unclear.", "Thinking ahead is natural."],
    },
}

TOPIC_ACK_HI_EXTRA = {
    "exams": {
        "negative": ["Exam ka pressure kisi ko bhi tod sakta hai, tum akele nahi ho.", "Padhai ka bojh sach mein thaka deta hai."],
        "positive": ["Wah, tumhari mehnat dikh rahi hai!", "Ye sunke bahut khushi hui, congratulations!"],
        "neutral": ["Padhai ka season mann ko vyast rakhta hai.", "Padhai kabhi kabhi marathon jaisi lagti hai."],
    },
    "work": {
        "negative": ["Kaam ka stress ghar tak aa jata hai, aur ye thakane wala hota hai.", "Kaam ka pressure kabhi kabhi bahut bhaari lagta hai."],
        "positive": ["Kaam me achhi baat hui, badhai ho!", "Ye toh bahut badhiya hai!"],
        "neutral": ["Kaam bahut sa dimaag le leta hai.", "Kaam me roz kuch na kuch chalta rehta hai."],
    },
    "family": {
        "negative": ["Ghar ki baatein dil par lagti hain kyunki wo humare liye bahut maayne rakhti hain.", "Ghar me tension ho to sab kuch bhaari lagta hai."],
        "positive": ["Ghar me achha pal hua, ye bahut keemti hai!", "Parivaar ke saath achha waqt, sunke accha laga!"],
        "neutral": ["Parivaar zindagi ka bada hissa hai, uske apne utaar-chadhav hote hain.", "Ghar ki zindagi kabhi kabhi complicated ho jati hai."],
    },
    "friends": {
        "negative": ["Dost se dikkat ho to dukh hota hai, kyunki wo hume pyaare hote hain.", "Dosti me problem bahut dard deti hai."],
        "positive": ["Achhe dost sab kuch behtar bana dete hain!", "Aise dost hona sach me badi baat hai."],
        "neutral": ["Dosti ke bhi alag alag mood hote hain.", "Dost humare din ko bahut asar karte hain."],
    },
    "relationship": {
        "negative": ["Rishton ki uljhanein bahut dard deti hain.", "Dil ki baatein kabhi kabhi bahut bhaari hoti hain."],
        "positive": ["Aww, ye toh pyaari baat hai!", "Rishte me achhi baat sunke accha laga."],
        "neutral": ["Rishton ke kai pehlu hote hain.", "Dil ke maamle aasan nahi hote."],
    },
    "health": {
        "negative": ["Sehat ya neend theek na ho to sab kuch mushkil lagta hai.", "Sehat ki chinta bahut thaka deti hai."],
        "positive": ["Behtar mehsoos karna kitni raahat deta hai, accha laga!", "Apni sehat ka dhyan rakhna kaam aa raha hai!"],
        "neutral": ["Sehat aur neend mood par bahut asar karte hain.", "Sharir aur mann ek dusre se jude hote hain."],
    },
    "money": {
        "negative": ["Paison ki chinta bahut stress deti hai, main samajh sakti hu.", "Paison ka dabav bhaari hota hai."],
        "positive": ["Paison ki achhi khabar se kitni raahat milti hai!", "Ye sunke tension kam hui hogi, badhiya!"],
        "neutral": ["Paison ki baatein dimaag ke peeche chalti rehti hain.", "Paison ke bare me sochna kabhi kabhi mushkil hota hai."],
    },
    "loneliness": {
        "negative": ["Akela mehsoos karna dukh deta hai, aur achha hai ki tumne bataya.", "Akelapan log kam hi batate hain, par ye bahut aam hai."],
        "positive": ["Ye accha hai ki ab tum zyada jude hue mehsoos kar rahe ho!", "Kam akela mehsoos karna ek badi baat hai."],
        "neutral": ["Kabhi saath aur kabhi akelapan, dono ke apne matlab hote hain.", "Akela hona alag alag cheezein ho sakta hai."],
    },
    "future": {
        "negative": ["Future ki chinta bahut thaka deti hai, khaaskar jab bahut kuch anjaan ho.", "Aage kya hoga ye na pata hona mushkil hota hai."],
        "positive": ["Future ke liye ummeed hona bahut pyaari baat hai!", "Aage ki taraf dekhna achha lagta hai, wah!"],
        "neutral": ["Future kabhi exciting aur kabhi dhundhla lagta hai.", "Aage ke baare me sochna swabhavik hai."],
    },
}

ACK_HI_EXTRA = {
    "low": ["Mujhe sach me dukh hua, ye dard bhara lagta hai.", "Tumne bataya, ye achha kiya.", "Tumhare jaise feel karna samajh aata hai.",
            "Aise din mushkil hote hain, aur tumhe dikhawa karne ki zaroorat nahi."],
    "anxious": ["Ye ghabrahat wali baat sach me pareshan karti hai.", "Dar lagna bilkul swabhavik hai, tum akele nahi ho.",
                "Chinta mann ko bechain kar deti hai, main samajhti hu.", "Batane ke liye shukriya, chinta ko naam dena bhi ek chhota kadam hai."],
    "angry": ["Tumhara gussa samajh aata hai, kuch to galat hua hoga.", "Ye sach me bura laga hoga.", "Aisi baat par gussa aana jayaz hai.",
              "Ye sunke mujhe bhi bura laga."],
    "happy": ["Wah, ye toh kamaal ki baat hai!", "Tumhari khushi mujhe bhi khush kar rahi hai!", "Bahut badhiya, aise pal sambhal ke rakhna!",
              "Ye sunke mera din ban gaya!"],
    "curious": ["Achha sawal hai, saath me sochte hain.", "Tumhara ye jigyasa wala andaaz achha laga.", "Hmm, ispe sochna banta hai.",
                "Thanks, ye batane ke liye."],
    "neutral": ["Main yahin hu, sun rahi hu.", "Theek hai, koi jaldi nahi hai.", "Samajh gayi.", "Tum apni raftaar se bolo, main sun rahi hu."],
    "proud": ["Kya baat hai, tumne ye kamaal kar diya!", "Bahut bahut badhai, tumne mehnat ka phal paaya!", "Mujhe tum par garv hai!"],
    "disappointed": ["Itni mehnat ke baad aisa result lagta to bura hai, main samajh sakti hu.", "Dil toot jata hai jab chaaha na mile.",
                     "Ek result tumhe define nahi karta, par aaj dard hai ye maanti hu."],
    "silver": ["Top ke itne kareeb aana bhi badi baat hai!", "Tumne bahut achha kiya, bhale hi aur ki umeed thi."],
    "selfcritic": ["Tum apne aap ke saath itne sakht ho, ye sunke dukh hua.", "Aisi soch sach lagti hai par poori sachchai nahi hoti."],
    "overwhelmed": ["Bahut kuch ek saath aa gaya hai, thakna swabhavik hai.", "Jab sab kuch ek saath ho, chhoti baatein bhi bhaari lagti hain."],
}

QUESTIONS_HI_EXTRA = {
    "low": ["Aaj sabse mushkil kya laga?", "Ye abhi hua ya kaafi time se chal raha hai?", "Abhi thoda sa sukoon kya de sakta hai?",
            "Kya apni baat kisi bharosemand se kar sakte ho?", "Ye feeling kab se hai?"],
    "anxious": ["Tumhara mann kya kehta hai ki kya ho sakta hai?", "Kya ye kisi aane wali cheez ki chinta hai?", "1 se 10 me ghabrahat kitni hai?",
                "Aksar kya tumhe thoda shaant karta hai?", "Chaho to baat karein ya ek chhota breathing exercise karein?"],
    "angry": ["Gussa aane se pehle kya hua tha?", "Ye ek insaan ki wajah se hai ya kai baatein hain?", "Kaun si cheez alag honi chahiye thi?",
              "Vent karna chaho to karo, main sun rahi hu.", "Thoda cool down hone me kya madad karega?"],
    "happy": ["Sabse achha hissa kaun sa tha?", "Ye kisse share karna chahoge?", "Celebrate kaise karoge?", "Sab kuch batao!", "Aaj sab itna achha kaise raha?"],
    "curious": ["Ye sochne ki wajah kya bani?", "Tum kya samajhna chahte ho?", "Kaun sa hissa atka hua hai?", "Idea chahiye ya bas bolkar sochna hai?"],
    "neutral": ["Aaj ka din kaisa raha?", "Kal neend kaisi aayi?", "Kuch hai jo aajkal dimaag me chal raha hai?", "Baat karni hai ya kuch tips chahiye?"],
    "proud": ["Yaha tak pahunchne me sabse mushkil kya tha?", "Celebrate kaise karne wale ho?"],
    "disappointed": ["Sabse zyada kya chubh raha hai?", "Ab agla chhota kadam kya ho sakta hai?"],
    "silver": ["Is safar me sabse zyada kis baat par garv hai?", "Is safar me kisne tumhara saath diya?"],
    "selfcritic": ["Aaj ye soch kyu aayi?", "Ek achha dost tumse abhi kya kehta?"],
    "overwhelmed": ["Kaun si ek cheez kal par taal sakte ho?", "Abhi ka sabse chhota kadam kya ho sakta hai?"],
}

GRIEF_EN = ["I'm so sorry. There are no right words, but I'm here with you.", "Losing someone changes everything. Please be gentle with yourself."]
GRIEF_HI = ["Mujhe bahut dukh hai. Sahi shabd nahi hote, par main tumhare saath hu.", "Kisi ko kho dena sab kuch badal deta hai. Apne aap par naram rehna."]
FOLLOWUPS_EXTRA = [
    "I'm glad you shared more about {topic}. What part of it feels the heaviest right now?",
    "Thank you for opening up about {topic}. What would help you the most right now?",
    "That helps me understand {topic} better. How are you coping with it?",
]
REASON_Q_EXTRA = ["What do you think would help the most right now?", "Is there a small thing that could make today easier?", "How does it feel to say that out loud?"]
REASON_Q_HI_EXTRA = ["Abhi tumhe sabse zyada kya madad karega?", "Kya koi chhoti cheez aaj ko aasan bana sakti hai?"]
MIXED_ACK_EXTRA = ["There's {a} and {b} mixed together right now, and both are valid.", "It's okay to hold {a} and {b} at once."]
MIXED_Q_EXTRA = ["What do you think is behind the {b}?", "Which one wants more attention right now?"]
MIXED_ACK_HI_EXTRA = ["Abhi {a} aur {b} dono saath hain, aur dono theek hain."]
MIXED_Q_HI_EXTRA = ["{b} ke peeche kya wajah lagti hai?"]

# ===================================================================== extra replies for existing intents
EN_INTENT_EXTRA = {
    "bye": ["Goodbye! Come back any time you feel like talking.", "Take care of yourself. I'll be here.", "Sleep well and be gentle with yourself."],
    "thanks": ["Happy to help! I'm here whenever you need.", "Of course! That's what I'm here for.", "You're always welcome here."],
    "greeting": ["Hi, so nice to see you! How are you feeling right now?", "Hey! I was hoping you'd drop by. How's everything?",
                 "Hello! What would you like to talk about today?", "Hi there! How has your day been?", "Hey, welcome! What's on your mind?"],
    "how_are_you": ["I'm good, thank you! Ready to listen. How are you doing today?", "Doing fine! More importantly, how are you really feeling?"],
    "who_are_you": ["I'm an AI chat companion. I listen, try to understand your feelings, and share simple tips. I'm not a therapist."],
    "joke": ["Why did the math book look sad? It had too many problems.", "I asked my phone for advice. It said: 'Try turning yourself off and on again.'",
             "Why don't skeletons fight each other? They don't have the guts.", "What do you call a sleeping dinosaur? A dino-snore!",
             "Why was the computer cold? It left its Windows open.", "I'm reading a book on anti-gravity. It's impossible to put down!",
             "Why did the student bring a ladder to class? Because the course was high level!", "What did one wall say to the other? I'll meet you at the corner."],
    "motivation": ["You've survived every bad day so far, and that's a 100% record. Take just one small step today.",
                   "You don't need to be perfect, just keep going at your own pace.", "Small steps still move you forward. Even resting counts as part of the journey.",
                   "Be proud of showing up today. That itself takes strength.", "Hard days don't last, but your effort does. You're doing better than you think.",
                   "Think of how far you've come, not only how far you have to go.", "Your worth isn't measured by your productivity. Breathe, then try again."],
    "bored": ["Try this: set a 5 minute timer and do something new, like doodling, stretching, or messaging a friend. Want more ideas?",
              "Boredom can be a hint that your mind wants something fresh. Music, a short walk, or a small challenge may help."],
    "affection": ["That's really sweet. I care about listening to you, though I'm just a bot. Is someone special on your mind?",
                  "Thank you, that means a lot. I'm here for you, and I hope you also have people around you who show you the same warmth."],
    "praise": ["Thank you, that makes me happy! I'm glad it helped.", "That's kind of you to say. I'm glad I could be here for you."],
    "insult": ["I'm sorry I wasn't helpful this time. Tell me what went wrong and I'll try again.", "That's okay, I know I'm not perfect. Want to tell me what you needed?"],
    "no_talk": ["That's completely okay. I'll be here if you change your mind.", "No pressure at all. Rest if you need to, and come back whenever you like."],
    "overthinking": ["Overthinking is tiring. Try writing the thought down, then ask: 'Is this a fact or a guess?' A short walk or music can also help."],
    "meditation": ["Try this one-minute version: sit comfortably, close your eyes, breathe in for 4 counts, out for 6, and just notice your breath. Repeat 6 times."],
}

HI_INTENT_EXTRA = {
    "how_are_you": ["Main theek hu, shukriya! Tum batao, aaj kaisa feel ho raha hai?", "Bilkul badhiya! Par zyada zaroori ye hai ki tum kaise ho."],
    "greeting": ["Namaste! Tumse milke achha laga. Aaj kaisa chal raha hai?", "Hi! Bolo, aaj kya haal hai?"],
    "who_are_you": ["Main ek AI chat saathi hu. Main tumhari baat sunti hu aur chhote tips deti hu. Main therapist nahi hu."],
    "thanks": ["Koi baat nahi! Main yahin hu jab bhi zaroorat ho.", "Tumhara swagat hai, aur baat karni ho to bolna."],
    "bye": ["Take care! Jab bhi mann kare, wapas aana.", "Apna dhyan rakhna, main yahin hu."],
    "sleep_tips": ["Neend ke liye: sone se ek ghanta pehle phone door rakho, kamre ko andhera aur thanda rakho, aur 4-6 saans wali breathing karo. Roz same time par sone ki koshish karo."],
    "study_tips": ["Padhai me mann nahi lag raha to 25 minute padho aur 5 minute break lo. Phone dusre kamre me rakho aur sabse chhota topic pehle uthao."],
}

# ===================================================================== NEW English intents (tight regexes)
NEW_EN_INTENTS = [
    ("breathing", r"\b(breathing exercise|breathe (with me|slowly)|how to (breathe|calm my breathing)|teach me to breathe|box breathing)\b",
     ["Let's try this together: breathe in through your nose for 4 counts, hold for 4, then breathe out slowly for 6. Repeat 5 times and let your shoulders drop. How do you feel after?",
      "Try box breathing: in for 4, hold for 4, out for 4, hold for 4. Do 4 rounds, slowly. I'll be right here."]),
    ("grounding", r"\b(grounding (exercise|technique)|5[- ]?4[- ]?3[- ]?2[- ]?1|ground myself)\b",
     ["Try the 5-4-3-2-1 method: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell and 1 you can taste. It brings your mind back to the present."]),
    ("anger_mgmt", r"\b(how to (control|manage|handle|stop) (my )?(anger|temper)|control my anger|anger (issues|problem|management))\b",
     ["When anger rises, pause before reacting: take 5 slow breaths, step away for a few minutes, and drink some water. Later, write down what triggered it. If it keeps happening, a counsellor can help a lot."]),
    ("stop_crying", r"\bhow to stop crying\b",
     ["Crying isn't a weakness, it's your body releasing stress. If you want to calm down, try slow breathing and a sip of water. Letting it out is okay too. Do you want to tell me what's behind it?"]),
    ("negative_thoughts", r"\b(negative thoughts|stop thinking negative|how to think positive(ly)?|think positively)\b",
     ["Try this: notice the thought, name it ('I'm having the thought that...'), then ask if it's a fact or a fear. Add one realistic alternative thought. It takes practice, so be patient with yourself."]),
    ("confidence", r"\b(low (self[- ]?)?(confidence|esteem)|build (my )?confidence|how to (be|become) confident|boost (my )?confidence)\b",
     ["Confidence grows from small wins. Set one tiny goal today, finish it, and notice that. Speak to yourself like you would to a friend, and keep a list of things you did well."]),
    ("handle_failure", r"\b(how to (handle|deal with|cope with|accept) (failure|rejection|a bad result)|afraid of failing|fear of failure)\b",
     ["Failure hurts, but it isn't the end of your story. Allow yourself to feel it, then ask: 'What did this teach me?' and pick one small next step. Many successful people failed several times first."]),
    ("will_get_better", r"\b(will (it|things|this) (get|be) better|will i be (ok|okay|fine)|does it get better)\b",
     ["Feelings change, even when it doesn't feel that way. Hard phases usually pass, especially with support. Be patient with yourself, and if it feels too heavy for too long, please reach out to a counsellor."]),
    ("do_you_care", r"\b(do you (really )?(care about me|understand me)|are you (listening|still there)|you there)\b",
     ["I'm here and I'm listening. I'm a bot, but I truly try to understand what you share. What's on your mind?"]),
    ("quote", r"\b(give me a (quote|positive thought)|motivational quote|inspirational quote|say something (nice|positive|good)|tell me something (nice|positive|good))\b",
     ["'You don't have to see the whole staircase, just take the first step.'", "'Be gentle with yourself, you are doing the best you can.'",
      "'This too shall pass.' Hold on, brighter days do come.", "'Every day may not be good, but there is something good in every day.'"]),
    ("fun_fact", r"\b(fun fact|tell me something interesting|random fact)\b",
     ["Fun fact: honey never spoils. Edible honey has been found in ancient Egyptian tombs!", "Fun fact: octopuses have three hearts and blue blood.",
      "Fun fact: a group of flamingos is called a flamboyance.", "Fun fact: your brain uses about 20% of your body's energy, even though it's only 2% of your weight."]),
    ("im_back", r"^(i am|i'?m|im) back[ !.]*$|^(hello again|hi again|back again)[ !.]*$",
     ["Welcome back! How have you been since we last talked?", "Hey, good to see you again! How are things now?"]),
    ("can_talk", r"\b(can i talk to you|can we talk|can i tell you something|can i share something|i want to talk|need someone to talk to)\b",
     ["Of course, I'm here and listening. Take your time, what would you like to share?", "Yes, absolutely. This is a safe space to talk. What's on your mind?"]),
    ("hug", r"\b(need a hug|give me a hug|virtual hug|hug me)\b",
     ["Sending you a big, warm virtual hug. You're not alone. Do you want to tell me what's going on?", "Here's a gentle hug from me. I'm right here with you."]),
    ("gratitude_practice", r"\b(gratitude (journal|practice|exercise)|how to (practice|be) grateful)\b",
     ["Try a 3-line gratitude note each night: one thing that went well, one person you appreciated, and one thing you're looking forward to. It slowly trains your mind to notice good moments."]),
    ("exercise_help", r"\b(does exercise help|should i exercise|exercise for (stress|anxiety|mood))\b",
     ["Yes, even a 10-20 minute walk can lift your mood and reduce stress. You don't need a gym, just movement you enjoy."]),
    ("social_anxiety", r"\b(social anxiety|stage fright|fear of public speaking|nervous (about|for) (a |my )?presentation|how to (talk|speak) (to|in front of) (people|crowd|class))\b",
     ["Feeling nervous around people is common. Practice your first line, breathe slowly before speaking, and start with small chats. Remember that most people are focused on themselves, not judging you."]),
    ("screen_time", r"\b(phone addiction|addicted to (my )?phone|too much (screen time|social media)|reduce screen time|doomscroll\w*)\b",
     ["Try small steps: turn off non-essential notifications, keep your phone away from your bed, and set app timers. Replace some scroll time with a walk, music, or a call with a friend."]),
    ("homesick", r"\b(homesick|miss (my )?(home|hostel))\b",
     ["Missing home is very natural, especially when everything around is new. Calling someone from home, keeping a small familiar thing near you and making small routines can help. What do you miss most?"]),
    ("get_over", r"\bhow to get over (him|her|my ex|a breakup|someone)\b",
     ["Healing takes time. Allow yourself to feel it, limit checking their profile, lean on friends, and fill your day with small things that are just for you. You will feel lighter, step by step."]),
    ("routine", r"\b(morning routine|night routine|bedtime routine)\b",
     ["A simple routine: wake at a fixed time, drink water, get some light and move a bit in the morning. At night, dim lights, put away your phone 30-60 minutes before bed, and take a few slow breaths."]),
    ("about_me", r"\b(tell me about yourself|introduce yourself)\b",
     ["I'm a supportive AI chat buddy. I try to understand how you're feeling from your words, listen, and share small tips for stress, sleep or study. I'm not a therapist, but I'm always happy to talk."]),
    ("define_burnout", r"\bwhat is burnout\b",
     ["Burnout is deep physical and emotional exhaustion from long-term stress, often with feeling detached or less capable. Rest, boundaries, and talking to someone can help. If it lasts, please see a counsellor or doctor."]),
    ("define_self_esteem", r"\bwhat is self[- ]?esteem\b",
     ["Self-esteem is how you value and see yourself. It grows through kind self-talk, small achievements and supportive people."]),
]

# ===================================================================== NEW Hinglish intents
NEW_HI_INTENTS = [
    ("joke", r"\b(joke sunao|koi joke|mazaak|hasao|hansao|mujhe hasao)\b",
     ["Teacher: Tum late kyu aaye? Student: Sir, sapne me exam de raha tha, pass hone tak uth nahi sakta tha!",
      "Pappu ne WiFi se kaha: 'Tu mere pass aa'. WiFi bola: 'Pehle password toh bata!'",
      "Doctor: Aapko aaram ki zaroorat hai. Patient: Sir, wo toh mere phone ko bhi hai, par charge hi nahi hota!",
      "Mummy: Beta, itni der se kya padh raha hai? Beta: Mummy, bas Wikipedia ka ek page khol ke baitha hu!"]),
    ("motivation", r"\b(motivate karo|motivation do|himmat do|hausla do|inspire karo|josh bharo)\b",
     ["Tum ab tak ke saare bure dino se nikal aaye ho, ye kam nahi hai. Aaj bas ek chhota kadam lo.",
      "Perfect hone ki zaroorat nahi, bas chalte raho apni raftaar se.",
      "Mushkil din hamesha nahi rehte, par tumhari koshish rehti hai. Tum socha usse behtar kar rahe ho.",
      "Aaj aane ka hi himmat chahiye thi, aur tumne wo dikhayi. Bahut badhiya."]),
    ("breathing", r"\b(breathing exercise|saans (ki|ka) exercise|gehri saans|saans lena sikhao)\b",
     ["Chalo saath me karte hain: naak se 4 count tak saans lo, 4 count roko, phir 6 count me dheere se chhodo. 5 baar dohrao aur kandhe dheele chhodo. Kaisa lag raha hai?"]),
    ("anger", r"\b(gussa (kaise )?(control|kam|rokna)|gusse (ko )?(control|kam)|gussa kam kaise)\b",
     ["Gussa aaye to react karne se pehle ruko: 5 gehri saansein lo, thodi der door chale jao aur paani piyo. Baad me likho ki kis baat se gussa aaya. Agar baar baar ho to counsellor se baat karna madadgaar hoga."]),
    ("confidence", r"\b(confidence (kaise|kam hai|nahi hai)|aatmavishwas|himmat nahi hoti)\b",
     ["Confidence chhoti jeet se badhta hai. Aaj ek chhota goal chuno, use poora karo aur usse notice karo. Apne aap se waise baat karo jaise dost se karte ho."]),
    ("overthinking", r"\b(overthinking|zyada (soch|sochta|sochti)|bahut (soch|sochta|sochti)|soch(na)? band)\b",
     ["Overthinking thaka deta hai. Soch ko kagaz par likho aur poochho: 'Ye fact hai ya sirf andaza?' Thoda tehal lo ya gaana suno, isse dimaag halka hota hai."]),
    ("stress_kam", r"\b(tension (kaise )?(kam|door)|stress (kaise )?(kam|door)|tension kam karne)\b",
     ["Stress kam karne ke liye: gehri saans lo, 10 minute tehal lo, paani piyo aur kaam ko chhote hisso me baant do. Kisi dost se baat karna bhi madad karta hai."]),
    ("bored", r"\b(bore ho raha|bore ho rahi|bore hu|bore ho gaya)\b",
     ["5 minute ka timer lagao aur kuch naya karo, jaise doodle, stretching ya kisi dost ko message. Aur ideas chahiye?"]),
    ("will_get_better", r"\b(kya sab theek (ho jayega|hoga)|sab theek ho jayega na|kya (ye|yeh) theek ho jayega)\b",
     ["Feelings badalti hain, bhale hi abhi aisa na lage. Mushkil daur aksar guzar jaate hain, khaaskar saath milne par. Apne aap par dhairya rakho, aur bahut bhaari lage to counsellor se baat karna."]),
    ("can_talk", r"\b(baat karni hai|baat karna chahta|baat karna chahti|kisi se baat karni|kuch batana hai)\b",
     ["Bilkul, main yahin hu aur sun rahi hu. Apna time lo, kya batana hai?", "Haan zaroor, ye safe jagah hai. Bolo, kya chal raha hai?"]),
    ("hug", r"\b(hug chahiye|gale lagao|jaadu ki jhappi|jhappi)\b",
     ["Ek badi si warm virtual jhappi tumhare liye. Tum akele nahi ho. Kya chal raha hai, batana chaho to?"]),
    ("care", r"\b(tum sunte ho|tum sun rahe ho|kya tum mujhe samajhte|tum samajhte ho|tum sunti ho)\b",
     ["Main yahin hu aur sun rahi hu. Main bot hu, par tumhari baat samajhne ki poori koshish karti hu. Bolo, kya chal raha hai?"]),
    ("screen_time", r"\b(phone ki lat|mobile ki lat|phone chhod|screen time|reel(s)? ki lat)\b",
     ["Chhote kadam lo: zaroori na hone wale notifications band karo, phone ko bistar se door rakho, aur app timer lagao. Scroll ke time ko tehalne, gaane ya dost se baat me lagao."]),
    ("homesick", r"\b(ghar ki yaad|ghar yaad|ghar ki bahut yaad)\b",
     ["Ghar ki yaad aana bilkul swabhavik hai, khaaskar jab sab kuch naya ho. Ghar par call karo, koi chhoti si purani cheez paas rakho aur chhote routine banao. Sabse zyada kya yaad aata hai?"]),
]


# Hinglish detection ke liye thode aur (sirf Hinglish) words
EXTRA_HINGLISH_WORDS = {"sunao", "hasao", "hansao", "mazaak", "himmat", "hausla", "josh", "bharo", "jhappi", "yaad", "soch",
                        "sochta", "sochti", "sunte", "sunti", "samajhte", "batana", "baat", "karni", "karo", "jayega", "hoga",
                        "tehal", "saans", "gehri", "gussa", "kam"}

# ===================================================================== apply
def apply():
    if getattr(rc, "_extras_applied", False):
        return
    # --- feeling pools
    _extend_map(rc.ACK, ACK_EN)
    _extend_map(rc.QUESTIONS, QUESTIONS_EN)
    _extend_map(rc.ACK_HI, ACK_HI_EXTRA)
    _extend_map(rc.QUESTIONS_HI, QUESTIONS_HI_EXTRA)
    for topic, by_val in TOPIC_ACK_EN.items():
        for val, lines in by_val.items():
            _extend(rc.TOPIC_ACK.setdefault(topic, {}).setdefault(val, []), lines)
    for topic, by_val in TOPIC_ACK_HI_EXTRA.items():
        for val, lines in by_val.items():
            _extend(rc.TOPIC_ACK_HI.setdefault(topic, {}).setdefault(val, []), lines)
    _extend(rc.GRIEF_ACK, GRIEF_EN)
    _extend(rc.GRIEF_ACK_HI, GRIEF_HI)
    _extend(rc.FOLLOWUPS, FOLLOWUPS_EXTRA)
    _extend(rc.REASON_Q, REASON_Q_EXTRA)
    _extend(rc.REASON_Q_HI, REASON_Q_HI_EXTRA)
    _extend(rc.MIXED_ACK, MIXED_ACK_EXTRA)
    _extend(rc.MIXED_QUESTIONS, MIXED_Q_EXTRA)
    _extend(rc.MIXED_ACK_HI, MIXED_ACK_HI_EXTRA)
    _extend(rc.MIXED_Q_HI, MIXED_Q_HI_EXTRA)

    # --- more replies for existing intents (same list objects are used by INTENT_RE)
    for name, _p, replies in rc.INTENTS:
        if replies is not None and name in EN_INTENT_EXTRA:
            _extend(replies, EN_INTENT_EXTRA[name])
    for name, _p, replies in rc.HI_INTENTS:
        if replies is not None and name in HI_INTENT_EXTRA:
            _extend(replies, HI_INTENT_EXTRA[name])

    # --- new intents go BEFORE the generic "help"/"filler" catch-alls
    def insert_before_help(intents, new):
        have = {n for n, _p, _r in intents}
        idx = next(i for i, (n, _p, _r) in enumerate(intents) if n == "help")
        intents[idx:idx] = [t for t in new if t[0] not in have]

    insert_before_help(rc.INTENTS, NEW_EN_INTENTS)
    insert_before_help(rc.HI_INTENTS, NEW_HI_INTENTS)
    # Hinglish phrases English list me bhi (alag naam se), taaki chhote messages ("joke sunao") bhi pakde jaayein
    insert_before_help(rc.INTENTS, [("hi_" + n, p, r) for n, p, r in NEW_HI_INTENTS])
    rc.HINGLISH_WORDS.update(EXTRA_HINGLISH_WORDS)
    rc.INTENT_RE = [(n, re.compile(p), r) for n, p, r in rc.INTENTS]
    rc.HI_INTENT_RE = [(n, re.compile(p), r) for n, p, r in rc.HI_INTENTS]
    rc._extras_applied = True


apply()
