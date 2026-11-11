import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Moon, BookOpen, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import "./AssessmentPages.css";
import { useLanguage } from "./language";

const hiText = {
 "Not at all":"बिल्कुल नहीं","Several days":"कई दिन","More than half the days":"आधे से ज़्यादा दिन","Nearly every day":"लगभग हर दिन",
 "Little interest or pleasure in doing things?":"कामों में रुचि या आनंद महसूस न होना?","Feeling down, depressed, or hopeless?":"उदास, निराश या हताश महसूस करना?","Trouble falling or staying asleep, or sleeping too much?":"नींद आने या सोते रहने में परेशानी, या बहुत ज़्यादा सोना?","Feeling tired or having little energy?":"थकान या ऊर्जा की कमी महसूस करना?","Poor appetite or overeating?":"भूख कम लगना या बहुत ज़्यादा खाना?","Feeling bad about yourself — or that you are a failure or have let yourself or your family down?":"अपने बारे में बुरा महसूस करना, खुद को असफल समझना या लगना कि आपने खुद को या परिवार को निराश किया है?","Trouble concentrating on things, such as reading or watching television?":"पढ़ने या टीवी देखने जैसी चीज़ों पर ध्यान लगाने में परेशानी?","Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around more than usual?":"इतनी धीमी गति से चलना या बोलना कि दूसरों ने ध्यान दिया हो? या इसके उलट, सामान्य से ज़्यादा बेचैन रहना या लगातार हिलते-डुलते रहना?","Thoughts that you would be better off dead or of hurting yourself in some way?":"ऐसे विचार आना कि काश आप जीवित न होते या किसी तरह खुद को नुकसान पहुँचाएँ?",
 "Feeling nervous, anxious, or on edge?":"घबराहट, चिंता या बेचैनी महसूस करना?","Not being able to stop or control worrying?":"चिंता को रोकने या नियंत्रित करने में परेशानी?","Worrying too much about different things?":"अलग-अलग बातों को लेकर बहुत ज़्यादा चिंता करना?","Trouble relaxing?":"आराम करने में परेशानी?","Being so restless that it is hard to sit still?":"इतनी बेचैनी कि शांत बैठना मुश्किल हो?","Becoming easily annoyed or irritable?":"आसानी से चिढ़ जाना या झुंझलाना?","Feeling afraid, as if something awful might happen?":"डर महसूस करना, जैसे कुछ बुरा होने वाला हो?",
 "How much difficulty did you have falling asleep?":"आपको नींद आने में कितनी परेशानी हुई?","How much difficulty did you have staying asleep?":"आपको सोते रहने में कितनी परेशानी हुई?","How much trouble did you have waking up too early?":"बहुत जल्दी जाग जाने में कितनी परेशानी हुई?","How satisfied are you with your current sleep?":"आप अपनी मौजूदा नींद से कितने संतुष्ट हैं?","How noticeable to others is your sleep problem?":"आपकी नींद की समस्या दूसरों को कितनी दिखाई देती है?","How worried are you about your sleep?":"आप अपनी नींद को लेकर कितने चिंतित हैं?","How much does your sleep affect your daily life?":"आपकी नींद आपकी रोज़मर्रा की ज़िंदगी को कितना प्रभावित करती है?",
 "None":"कोई नहीं","Mild":"हल्की","Moderate":"मध्यम","Severe":"गंभीर","Very severe":"बहुत गंभीर","Very satisfied":"बहुत संतुष्ट","Satisfied":"संतुष्ट","Neutral":"न सामान्य, न असंतुष्ट","Dissatisfied":"असंतुष्ट","Very dissatisfied":"बहुत असंतुष्ट","A little":"थोड़ा","Somewhat":"कुछ हद तक","Much":"काफी","Very much":"बहुत ज़्यादा",
 "Difficulty falling asleep":"नींद आने में कठिनाई","Waking up during the night":"रात में नींद खुलना","Waking up too early":"बहुत जल्दी जागना","Not feeling satisfied with your sleep":"नींद से संतुष्ट न होना","Sleep problems others can notice":"नींद की ऐसी समस्या जो दूसरों को दिखे","Worry about your sleep":"नींद को लेकर चिंता","Sleep affecting your daily life":"नींद का रोज़मर्रा की ज़िंदगी पर असर",
 "Study and school":"पढ़ाई और स्कूल","Sleep and body":"नींद और शरीर","Daily life and people":"रोज़मर्रा की ज़िंदगी और लोग","Your surroundings":"आपका आसपास का माहौल",
 "How heavy is your study load?":"आपकी पढ़ाई का बोझ कितना है?","How do you rate your own academic performance?":"आप अपने शैक्षणिक प्रदर्शन को कैसे आँकते हैं?","How worried are you about your career?":"आप अपने करियर को लेकर कितने चिंतित हैं?","How is your relationship with your teachers?":"आपका शिक्षकों के साथ संबंध कैसा है?","How well do you sleep?":"आपकी नींद कैसी रहती है?","How often do you get headaches?":"आपको कितनी बार सिरदर्द होता है?","Do you have trouble breathing?":"क्या आपको साँस लेने में परेशानी होती है?","What is your blood pressure usually?":"आमतौर पर आपका रक्तचाप कैसा रहता है?","How much support do you get from people around you?":"आपको आसपास के लोगों से कितना सहयोग मिलता है?","How much pressure do you feel from your peers?":"आप अपने साथियों से कितना दबाव महसूस करते हैं?","How busy are you with clubs and activities?":"क्लब और अन्य गतिविधियों में आप कितने व्यस्त रहते हैं?","Have you faced bullying?":"क्या आपको कभी परेशान या बुली किया गया है?","How noisy is the place where you live or study?":"जहाँ आप रहते या पढ़ते हैं, वहाँ कितना शोर होता है?","How comfortable is your living space?":"आपका रहने का स्थान कितना आरामदायक है?","How safe do you feel where you live?":"आप जहाँ रहते हैं, वहाँ खुद को कितना सुरक्षित महसूस करते हैं?","How well are your basic needs met (food, rest, money)?":"आपकी बुनियादी ज़रूरतें (भोजन, आराम, पैसे) कितनी पूरी होती हैं?",
 "0 - None":"0 - बिल्कुल नहीं","1 - Very light":"1 - बहुत कम","2 - Light":"2 - कम","3 - Moderate":"3 - मध्यम","4 - Heavy":"4 - ज़्यादा","5 - Very heavy":"5 - बहुत ज़्यादा","0 - Not at all":"0 - बिल्कुल नहीं","1 - Very little":"1 - बहुत कम","2 - A little":"2 - थोड़ा","3 - Somewhat":"3 - कुछ हद तक","4 - Quite a lot":"4 - काफी","5 - Very much":"5 - बहुत ज़्यादा","0 - Never":"0 - कभी नहीं","1 - Rarely":"1 - बहुत कम","2 - Sometimes":"2 - कभी-कभी","3 - Often":"3 - अक्सर","4 - Very often":"4 - बहुत बार","5 - Almost daily":"5 - लगभग रोज़","0 - None":"0 - बिल्कुल नहीं","1 - A little":"1 - थोड़ा","2 - Good":"2 - अच्छा","3 - Strong":"3 - मज़बूत","4 - A lot":"4 - बहुत","5 - Extreme":"5 - अत्यधिक","0 - Silent":"0 - बिल्कुल शांत","1 - Very quiet":"1 - बहुत शांत","2 - Quiet":"2 - शांत","3 - Some noise":"3 - थोड़ा शोर","4 - Noisy":"4 - शोरगुल वाला","5 - Very noisy":"5 - बहुत शोरगुल वाला",
 "0 - Very poor":"0 - बहुत खराब","1 - Poor":"1 - खराब","2 - Below average":"2 - औसत से कम","3 - Average":"3 - औसत","4 - Good":"4 - अच्छा","5 - Excellent":"5 - उत्कृष्ट",
 "0 - Very poorly":"0 - बहुत खराब","1 - Poorly":"1 - खराब","2 - Not well":"2 - ठीक नहीं","3 - Okay":"3 - ठीक","4 - Well":"4 - अच्छी","5 - Very well":"5 - बहुत अच्छी",
 "1 - Slightly":"1 - थोड़ा","3 - Moderately":"3 - मध्यम","4 - Very":"4 - बहुत","5 - Extremely":"5 - अत्यधिक",
 "0 - Very uncomfortable":"0 - बहुत असुविधाजनक","1 - Uncomfortable":"1 - असुविधाजनक","2 - Slightly uncomfortable":"2 - थोड़ा असुविधाजनक","4 - Comfortable":"4 - आरामदायक","5 - Very comfortable":"5 - बहुत आरामदायक",
 "0 - Not safe at all":"0 - बिल्कुल सुरक्षित नहीं","1 - Unsafe":"1 - असुरक्षित","2 - Slightly unsafe":"2 - थोड़ा असुरक्षित","4 - Safe":"4 - सुरक्षित","5 - Very safe":"5 - बहुत सुरक्षित",
 "0 - Not met at all":"0 - बिल्कुल पूरी नहीं","1 - Barely met":"1 - मुश्किल से पूरी","2 - Partly met":"2 - आंशिक रूप से पूरी","3 - Mostly met":"3 - अधिकतर पूरी","4 - Well met":"4 - अच्छी तरह पूरी","5 - Fully met":"5 - पूरी तरह पूरी",
 "Very poor":"बहुत खराब","Poor":"खराब","Below average":"औसत से कम","Average":"औसत","Excellent":"उत्कृष्ट","Very poorly":"बहुत खराब","Poorly":"खराब","Not well":"ठीक नहीं","Okay":"ठीक","Well":"अच्छी","Very well":"बहुत अच्छी","Slightly":"थोड़ा","Moderately":"मध्यम","Very":"बहुत","Extremely":"अत्यधिक","Very uncomfortable":"बहुत असुविधाजनक","Uncomfortable":"असुविधाजनक","Slightly uncomfortable":"थोड़ा असुविधाजनक","Comfortable":"आरामदायक","Very comfortable":"बहुत आरामदायक","Not safe at all":"बिल्कुल सुरक्षित नहीं","Unsafe":"असुरक्षित","Slightly unsafe":"थोड़ा असुरक्षित","Safe":"सुरक्षित","Very safe":"बहुत सुरक्षित","Not met at all":"बिल्कुल पूरी नहीं","Barely met":"मुश्किल से पूरी","Partly met":"आंशिक रूप से पूरी","Mostly met":"अधिकतर पूरी","Well met":"अच्छी तरह पूरी","Fully met":"पूरी तरह पूरी",
 "Back to dashboard":"डैशबोर्ड पर वापस जाएँ","A GENTLE SELF-CHECK":"एक सहज आत्म-जाँच","Wellbeing Check-in":"वेलबीइंग चेक-इन","16 short questions about how you have been feeling over the last two weeks. This is a screening tool, not a diagnosis.":"पिछले दो हफ्तों में आप कैसा महसूस कर रहे हैं, इस बारे में 16 छोटे सवाल। यह केवल शुरुआती आकलन है, निदान नहीं।","YOUR MIND, YOUR PACE":"आपका मन, आपकी गति","A little pause can tell you a lot.":"एक छोटा-सा ठहराव आपको बहुत कुछ समझा सकता है।","This is your quiet corner to notice what has been happening inside — no judgement, no perfect answers.":"यह अपने भीतर चल रही बातों को समझने की आपकी शांत जगह है — न कोई निर्णय, न कोई सही या गलत जवाब।","✦ 2 gentle check-ins":"✦ दो सहज जाँच","◷ about 4 minutes":"◷ लगभग 4 मिनट","Mood check":"मूड की जाँच","Worry check":"चिंता की जाँच","9 questions about interest, mood, sleep and energy.":"रुचि, मूड, नींद और ऊर्जा से जुड़े 9 सवाल।","7 questions about nervousness, worry and restlessness.":"घबराहट, चिंता और बेचैनी से जुड़े 7 सवाल।","Only a qualified professional can diagnose or treat a mental health condition.":"मानसिक स्वास्थ्य से जुड़ी किसी स्थिति का निदान या उपचार केवल योग्य विशेषज्ञ ही कर सकते हैं।","Start check-in":"जाँच शुरू करें","Question":"सवाल","of":"में से","YOUR INNER WEATHER":"आपके मन का हाल","YOUR THOUGHT SPACE":"आपके विचार","Take your time. There is no right or wrong answer.":"आराम से जवाब दें। कोई जवाब सही या गलत नहीं है।","Over the last 2 weeks, how often have you had this problem?":"पिछले 2 हफ्तों में आपको यह परेशानी कितनी बार हुई?","Back":"वापस","Next":"आगे","See my summary":"मेरा सारांश देखें","You don’t have to handle this alone":"आपको यह सब अकेले नहीं संभालना है","One of your answers suggests you may have had thoughts of hurting yourself. These thoughts can be difficult to carry. Talking to someone you trust or a qualified professional can help.":"आपके एक जवाब से लगता है कि आपके मन में खुद को नुकसान पहुँचाने के विचार आए हो सकते हैं। ऐसे विचारों के साथ अकेले रहना कठिन हो सकता है। किसी भरोसेमंद व्यक्ति या योग्य विशेषज्ञ से बात करना मददगार हो सकता है।","If you are in immediate danger, contact local emergency services now.":"अगर आप तत्काल खतरे में हैं, तो अभी स्थानीय आपातकालीन सेवाओं से संपर्क करें।","You can continue to your summary whenever you feel ready.":"जब आप तैयार महसूस करें, तब अपने सारांश पर आगे बढ़ सकते हैं।","Review answers":"जवाब दोबारा देखें","Continue to my summary":"मेरे सारांश पर जाएँ","Your check-in summary":"आपकी जाँच का सारांश","Minimal":"न्यूनतम","Moderately severe":"काफी गंभीर","PHQ-9":"PHQ-9","GAD-7":"GAD-7","Minimal 0–4 · Mild 5–9 · Moderate 10–14 · Moderately severe 15–19 · Severe 20–27":"न्यूनतम 0–4 · हल्का 5–9 · मध्यम 10–14 · काफी गंभीर 15–19 · गंभीर 20–27","Minimal 0–4 · Mild 5–9 · Moderate 10–14 · Severe 15–21":"न्यूनतम 0–4 · हल्का 5–9 · मध्यम 10–14 · गंभीर 15–21","These scores describe your answers, not a diagnosis. If the results worry you, consider speaking with a doctor, counsellor or someone you trust.":"ये स्कोर आपके जवाबों को दर्शाते हैं, निदान नहीं। यदि परिणामों को लेकर चिंता हो, तो डॉक्टर, काउंसलर या किसी भरोसेमंद व्यक्ति से बात करें।","Check in again later":"बाद में फिर से जाँचें","See coping suggestions":"सहायता के सुझाव देखें",
 "REST & RECOVERY":"आराम और पुनर्स्थापन","How has your sleep been?":"आपकी नींद कैसी रही है?","Answer seven questions about the last two weeks and reflect on your sleep pattern.":"पिछले दो हफ्तों के बारे में सात सवालों के जवाब दें और अपनी नींद के पैटर्न को समझें।","THE DREAM LAB":"सपनों की दुनिया","Build a picture of your nights.":"अपनी रातों के पैटर्न को समझें।","Sleep is more than a number. Explore your rhythm, then reflect on what may be interrupting your rest.":"नींद केवल एक संख्या नहीं है। अपनी दिनचर्या समझें और जानें कि कौन-सी बातें आपके आराम में बाधा डाल सकती हैं।","REST":"आराम","MODE":"का समय","YOUR SLEEP RHYTHM":"आपकी नींद की लय","A night, mapped by you":"आपकी रात का नक्शा","in bed":"बिस्तर पर","Bedtime":"सोने का समय","Wake-up":"जागने का समय","Move the times to sketch your usual sleep window. This is a reflection aid, not a sleep measurement.":"अपने सोने और जागने का सामान्य समय चुनें। यह आत्म-चिंतन के लिए है, नींद का वास्तविक माप नहीं।","YOUR NIGHTLY RESET":"आपकी रात का विश्राम","sleep reflections completed":"नींद से जुड़े जवाब पूरे हुए","SLEEP REFLECTION":"नींद पर विचार","Your sleep":"आपकी नींद","Choose the answer that fits you best.":"वह जवाब चुनें जो आप पर सबसे सही बैठता है।","About you":"आपके बारे में","These details are part of the demo form.":"ये जानकारी डेमो फ़ॉर्म का हिस्सा है।","Age":"उम्र","Gender":"लिंग","Smoking":"धूम्रपान","Drinking":"शराब का सेवन","Female":"महिला","Male":"पुरुष","Never smokes":"कभी धूम्रपान नहीं","Occasional smoker":"कभी-कभार धूम्रपान","Current smoker":"वर्तमान में धूम्रपान","Former smoker":"पहले धूम्रपान करते थे","Never drinks":"कभी शराब नहीं","Occasionally (less than once a week)":"कभी-कभार (हफ्ते में एक बार से कम)","Regularly (more than once a week)":"नियमित रूप से (हफ्ते में एक बार से अधिक)","In the past":"पहले सेवन करते थे","Clear answers":"जवाब मिटाएँ","Check my sleep pattern":"मेरी नींद का पैटर्न देखें","Demo calculation — not a real model prediction":"डेमो गणना — यह वास्तविक मॉडल का अनुमान नहीं है","Your sleep pattern looks steady":"आपकी नींद का पैटर्न संतुलित दिखता है","Your sleep seems a little disturbed":"आपकी नींद में थोड़ी परेशानी दिखती है","Your sleep needs some attention":"आपकी नींद पर थोड़ा ध्यान देने की ज़रूरत है","Biggest sleep concern:":"नींद से जुड़ी सबसे बड़ी चिंता:","This is a wellness check, not a medical diagnosis. A real model result is not connected yet.":"यह वेलनेस जाँच है, चिकित्सकीय निदान नहीं। अभी वास्तविक मॉडल का परिणाम इससे जुड़ा नहीं है।",
 "STUDY, SLEEP & SURROUNDINGS":"पढ़ाई, नींद और आसपास का माहौल","Academic Stress Pattern Predictor":"अकादमिक तनाव पैटर्न प्रेडिक्टर","Answer 16 short questions to see which patterns may be associated with your self-reported stress.":"16 छोटे सवालों के जवाब देकर समझें कि आपके बताए तनाव से कौन-से पैटर्न जुड़े हो सकते हैं।","THE STUDENT OBSERVATORY":"विद्यार्थी जीवन की झलक","Your life is more than your deadlines.":"आपकी ज़िंदगी डेडलाइन से कहीं बढ़कर है।","Let’s look at the different forces around your study life — workload, energy, people and your environment.":"आइए पढ़ाई से जुड़ी अलग-अलग बातों को समझें — काम का बोझ, ऊर्जा, लोग और आपका माहौल।","01 · Study":"01 · पढ़ाई","02 · Body":"02 · शरीर","03 · People":"03 · लोग","04 · Space":"04 · परिवेश","STUDENT WELLBEING SNAPSHOT":"विद्यार्थी वेलबीइंग की झलक","Let’s understand your study-life balance.":"आइए पढ़ाई और जीवन के संतुलन को समझें।","A few honest answers can help highlight where pressure may be building.":"कुछ सच्चे जवाब यह समझने में मदद कर सकते हैं कि दबाव कहाँ बढ़ रहा है।","answered":"जवाब दिए","Choose the option that fits best. The exact option values are sent to the predictor.":"सबसे उपयुक्त विकल्प चुनें। चुने गए विकल्पों के मान प्रेडिक्टर को भेजे जाएँगे।","Choose":"चुनें","Clear answers":"जवाब मिटाएँ","Checking…":"जाँच हो रही है…","See my result":"मेरा परिणाम देखें","The predictor service is not available right now.":"प्रेडिक्टर सेवा अभी उपलब्ध नहीं है।","The predictor response was incomplete.":"प्रेडिक्टर से अधूरा जवाब मिला।","Could not connect to the predictor. Please try again later.":"प्रेडिक्टर से कनेक्ट नहीं हो पाया। कृपया बाद में फिर कोशिश करें।","Your pattern summary":"आपके पैटर्न का सारांश","stress":"तनाव","Patterns associated with your answers":"आपके जवाबों से जुड़े पैटर्न","This student project shows associations, not causes. It is not a diagnosis and does not measure burnout.":"यह छात्र परियोजना केवल संभावित संबंध दिखाती है, कारण नहीं। यह निदान नहीं करती और बर्नआउट नहीं मापती।",
 "Your stress":"आपका तनाव","Think about the last month. Choose how often each statement applied to you.":"पिछले एक महीने के बारे में सोचें। चुनें कि हर बात आपके साथ कितनी बार हुई।","How often have you been upset because of something that happened unexpectedly?":"कितनी बार किसी अचानक हुई घटना के कारण आप परेशान हुए?","How often have you felt unable to control the important things in your life?":"कितनी बार आपको लगा कि आप अपने जीवन की ज़रूरी चीज़ों को नियंत्रित नहीं कर पा रहे हैं?","How often have you felt nervous and stressed?":"कितनी बार आपने घबराहट और तनाव महसूस किया?","How often have you felt that difficulties were piling up so high that you could not overcome them?":"कितनी बार आपको लगा कि मुश्किलें इतनी बढ़ गई हैं कि आप उन्हें पार नहीं कर सकते?","Never":"कभी नहीं","Almost never":"लगभग कभी नहीं","Sometimes":"कभी-कभी","Fairly often":"काफी बार","Very often":"बहुत बार","4 stress reflections completed":"तनाव से जुड़े 4 जवाब पूरे हुए"
};
function translate(value, hi) { return hi && typeof value === "string" ? (hiText[value] || value) : value; }
const tr = (value, hi) => translate(value, hi);
function Localized({ children, hi }) {
 const walk = (node) => {
  if (typeof node === "string") return translate(node, hi);
  if (typeof node === "number" || node == null || typeof node === "boolean") return node;
  if (Array.isArray(node)) return node.map(walk);
  if (!React.isValidElement(node)) return node;
  if (node.props?.["data-raw-api"]) return node;
  const props = { ...node.props };
  for (const key of ["placeholder","title","aria-label","alt"]) if (typeof props[key] === "string") props[key] = translate(props[key], hi);
  if (props.children !== undefined) props.children = walk(props.children);
  return React.cloneElement(node, props);
 };
 return <>{walk(children)}</>;
}



const scale4 = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
const phq = [
 "Little interest or pleasure in doing things?",
 "Feeling down, depressed, or hopeless?",
 "Trouble falling or staying asleep, or sleeping too much?",
 "Feeling tired or having little energy?",
 "Poor appetite or overeating?",
 "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
 "Trouble concentrating on things, such as reading the newspaper or watching television?",
 "Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless that you have been moving around a lot more than usual?",
 "Thoughts that you would be better off dead or of hurting yourself in some way?"
];
const gad = [
 "Feeling nervous, anxious, or on edge?",
 "Not being able to stop or control worrying?",
 "Worrying too much about different things?",
 "Trouble relaxing?",
 "Being so restless that it is hard to sit still?",
 "Becoming easily annoyed or irritable?",
 "Feeling afraid, as if something awful might happen?"
];
const isi = [
 {name:"isi_1",text:"Difficulty falling asleep.",opts:["None","Mild","Moderate","Severe","Very Severe"]},
 {name:"isi_2",text:"Difficulty staying asleep.",opts:["None","Mild","Moderate","Severe","Very Severe"]},
 {name:"isi_3",text:"Problem waking up too early in the morning.",opts:["None","Mild","Moderate","Severe","Very Severe"]},
 {name:"isi_4",text:"How SATISFIED/dissatisfied are you with your current sleep pattern?",opts:["Very Satisfied","Satisfied","Neutral","Dissatisfied","Very Dissatisfied"]},
 {name:"isi_5",text:"To what extent do you consider your sleep problem to INTERFERE with your daily functioning (e.g., daytime fatigue, ability to function at work/daily chores, concentration, memory, mood)?",opts:["Not at all Interfering","A little Interfering","Somewhat Interfering","Very Interfering","Extremely Interfering"]},
 {name:"isi_6",text:"How NOTICEABLE to others do you think your sleeping problem is in terms of impairing the quality of your life?",opts:["Not at all Noticeable","A little Noticeable","Somewhat Noticeable","Very Noticeable","Extremely Noticeable"]},
 {name:"isi_7",text:"How WORRIED/distressed are you about your current sleep problem?",opts:["Not at all","A little","Somewhat","Very","Extremely"]}
];
const stressQuestions = [
 {name:"pss_1",text:"In the last month, how often have you been upset because of something that happened unexpectedly?"},
 {name:"pss_2",text:"In the last month, how often have you felt that you were unable to control the important things in your life?"},
 {name:"pss_3",text:"In the last month, how often have you felt nervous and “stressed”?"},
 {name:"pss_4",text:"In the last month, how often have you dealt successfully with day to day problems and annoyances?"},
 {name:"pss_5",text:"In the last month, how often have you felt that you were effectively coping with important changes that were occurring in your life?"},
 {name:"pss_6",text:"In the last month, how often have you felt confident about your ability to handle your personal problems?"},
 {name:"pss_7",text:"In the last month, how often have you felt that things were going your way?"},
 {name:"pss_8",text:"In the last month, how often have you found that you could not cope with all the things that you had to do?"},
 {name:"pss_9",text:"In the last month, how often have you been able to control irritations in your life?"},
 {name:"pss_10",text:"In the last month, how often have you felt that you were on top of things?"},
 {name:"pss_11",text:"In the last month, how often have you been angered because of things that happened that were outside of your control?"},
 {name:"pss_12",text:"In the last month, how often have you found yourself thinking about things that you have to accomplish?"},
 {name:"pss_13",text:"In the last month, how often have you been able to control the way you spend your time?"},
 {name:"pss_14",text:"In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"}
];
const stressScale = ["Never","Almost never","Sometimes","Fairly often","Very often"];
const mindCheckSession = { phq9Answers: null, phq9Draft: {}, isiAnswers: {}, pssAnswers: {}, profile: { age: "", gender: "", edu: "", smoke: "", drink: "" }, skipMl: false };
const academicGroups = [
 {title:"Study and school",items:[
  ["study_load","How heavy is your study load?",["0 - None","1 - Very light","2 - Light","3 - Moderate","4 - Heavy","5 - Very heavy"]],
  ["academic_performance","How do you rate your own academic performance?",["0 - Very poor","1 - Poor","2 - Below average","3 - Average","4 - Good","5 - Excellent"]],
  ["future_career_concerns","How worried are you about your career?",["0 - Not at all","1 - Very little","2 - A little","3 - Somewhat","4 - Quite a lot","5 - Very much"]],
  ["teacher_student_relationship","How is your relationship with your teachers?",["0 - Very poor","1 - Poor","2 - Below average","3 - Average","4 - Good","5 - Excellent"]]
 ]},
 {title:"Sleep and body",items:[
  ["sleep_quality","How well do you sleep?",["0 - Very poorly","1 - Poorly","2 - Not well","3 - Okay","4 - Well","5 - Very well"]],
  ["headache","How often do you get headaches?",["0 - Never","1 - Rarely","2 - Sometimes","3 - Often","4 - Very often","5 - Almost daily"]],
  ["breathing_problem","Do you have trouble breathing?",["0 - Never","1 - Rarely","2 - Sometimes","3 - Often","4 - Very often","5 - Almost daily"]],
  ["blood_pressure","What is your blood pressure usually?",["1 - Low","2 - Normal","3 - High"]]
 ]},
 {title:"Daily life and people",items:[
  ["social_support","How much support do you get from people around you?",["0 - None","1 - A little","2 - Good","3 - Strong"]],
  ["peer_pressure","How much pressure do you feel from your peers?",["0 - None","1 - Very little","2 - A little","3 - Some","4 - A lot","5 - Extreme"]],
  ["extracurricular_activities","How busy are you with clubs and activities?",["0 - Not at all","1 - Slightly","2 - A little","3 - Moderately","4 - Very","5 - Extremely"]],
  ["bullying","Have you faced bullying?",["0 - Never","1 - Rarely","2 - Sometimes","3 - Often","4 - Very often","5 - All the time"]]
 ]},
 {title:"Your surroundings",items:[
  ["noise_level","How noisy is the place where you live or study?",["0 - Silent","1 - Very quiet","2 - Quiet","3 - Some noise","4 - Noisy","5 - Very noisy"]],
  ["living_conditions","How comfortable is your living space?",["0 - Very uncomfortable","1 - Uncomfortable","2 - Slightly uncomfortable","3 - Okay","4 - Comfortable","5 - Very comfortable"]],
  ["safety","How safe do you feel where you live?",["0 - Not safe at all","1 - Unsafe","2 - Slightly unsafe","3 - Okay","4 - Safe","5 - Very safe"]],
  ["basic_needs","How well are your basic needs met (food, rest, money)?",["0 - Not met at all","1 - Barely met","2 - Partly met","3 - Mostly met","4 - Well met","5 - Fully met"]]
 ]}
];
function Shell({eyebrow,title,subtitle,children,icon:Icon=Heart}) {
 const nav=useNavigate(); const [language]=useLanguage(); const hi=language==="hi"; const pageKind=String(title).includes("Sleep")||String(title).includes("sleep")?"sleep":String(title).includes("Academic")?"academic":"wellbeing";
 return <main className={`assessment-page assessment-${pageKind}`}><button className="assessment-back" onClick={()=>nav("/dashboard")}><ArrowLeft size={16}/>{tr("Back to dashboard",hi)}</button><header className="assessment-heading"><span className="assessment-mark"><Icon size={22}/></span><div className="assessment-heading-copy"><span className="assessment-eyebrow">{tr(eyebrow,hi)}</span><h1>{tr(title,hi)}</h1><p>{tr(subtitle,hi)}</p></div><div className="assessment-heading-art" aria-hidden="true"><span className="art-orbit orbit-one"/><span className="art-orbit orbit-two"/><span className="art-core"><Icon size={30}/></span><i className="art-spark spark-one">✦</i><i className="art-spark spark-two">✧</i></div></header><Localized hi={hi}>{children}</Localized></main>;
}
function OptionList({options,value,onChange}) { const [language]=useLanguage(); const hi=language==="hi"; return <div className="assessment-options">{options.map((o,i)=><button type="button" key={i} className={String(value)===String(i)?"is-selected":""} onClick={()=>onChange(i)}>{tr(o,hi)}</button>)}</div>; }
function ClinicalOptions({options,value,onChange,offset=0}) {
 return <div className="assessment-options">{options.map((option,index)=><button type="button" key={option} className={Number(value)===index+offset?"is-selected":""} onClick={()=>onChange(index+offset)}>{option}</button>)}</div>;
}
export function WellbeingCheckinPage(){
 const navigate=useNavigate();
 const [step,setStepState]=useState(()=>{try{const saved=sessionStorage.getItem("mindcheck-wellbeing-step");return saved===null?-1:Number(saved);}catch{return -1;}});
 const [answers,setAnswers]=useState(()=>{try{return JSON.parse(sessionStorage.getItem("mindcheck-wellbeing-answers")||"null")||mindCheckSession.phq9Draft||{};}catch{return mindCheckSession.phq9Draft||{};}});
 const setStep=(next)=>setStepState(current=>{const value=typeof next==="function"?next(current):next;try{sessionStorage.setItem("mindcheck-wellbeing-step",String(value));}catch{}return value;});
 const questions=useMemo(()=>[...phq.map((q,i)=>({q,group:"Mood check",n:i+1})),...gad.map((q,i)=>({q,group:"Worry check",n:i+1}))],[]);
 const setAnswer=(v)=>setAnswers(a=>{const next={...a,[step]:v};mindCheckSession.phq9Draft=next;try{sessionStorage.setItem("mindcheck-wellbeing-answers",JSON.stringify(next));}catch{}return next;});
 const reset=()=>{mindCheckSession.phq9Answers=null;mindCheckSession.phq9Draft={};setAnswers({});try{sessionStorage.removeItem("mindcheck-wellbeing-step");sessionStorage.removeItem("mindcheck-wellbeing-answers");}catch{}setStep(-1);};
 const finish=()=>{
  const ordered=Array.from({length:16},(_,i)=>answers[i]);
  if(ordered.some(value=>value===undefined))return;
  mindCheckSession.phq9Answers=ordered;mindCheckSession.phq9Draft=Object.fromEntries(ordered.map((value,index)=>[index,value]));
  navigate("/sleep-check");
 };
 return <Shell eyebrow="A GENTLE SELF-CHECK" title="Wellbeing Check-in" subtitle="16 questions about how you have been feeling over the last two weeks. This is a screening tool, not a diagnosis.">
 {step===-1?<section className="assessment-panel assessment-intro">
  <div className="wellbeing-journey-hero"><div><span className="overview-kicker">YOUR MIND, YOUR PACE</span><h2>A little pause can tell you a lot.</h2><p>This is your quiet corner to notice what has been happening inside — no judgement, no perfect answers.</p><div className="journey-stamps"><span>✦ 2 gentle check-ins</span><span>◷ 42 questions across two check-ins</span></div></div><div className="wellbeing-orbit"><i>☼</i><b>YOU</b><span>✦</span><em>♡</em></div></div>
  <div className="assessment-mini-grid"><article><span>01</span><h3>Mood check</h3><p>9 questions about interest, mood, sleep and energy.</p><strong>PHQ-9</strong></article><article><span>02</span><h3>Worry check</h3><p>7 questions about nervousness, worry and restlessness.</p><strong>GAD-7</strong></article></div>
  <p className="assessment-disclaimer">Your answers are not stored on our servers. They stay temporarily in this active browser session and are sent together only when you submit the complete check-in.</p>
  <button className="assessment-primary" onClick={()=>setStep(0)}>Start check-in <ArrowRight size={17}/></button>
 </section>:null}
 {step>=0?<section className="assessment-panel">
  <div className="assessment-progress-line"><span>{questions[step].group} · Question {step+1} of 16</span><strong>{Math.round((step+1)/16*100)}%</strong></div>
  <div className="assessment-progress"><span style={{width:((step+1)/16*100)+"%"}}/></div>
  <div className="wellbeing-question-meta"><span className="wellbeing-step-bubble">{String(step+1).padStart(2,"0")}</span><div><b>{questions[step].group==="Mood check"?"YOUR INNER WEATHER":"YOUR THOUGHT SPACE"}</b><small>Take your time. There is no right or wrong answer.</small></div><span className="wellbeing-sparkle">✦</span></div>
  <p className="assessment-timeframe">Over the last 2 weeks, how often have you been bothered by the following problems?</p>
  <h2 className="assessment-question">{questions[step].q}</h2>
  <ClinicalOptions options={scale4} value={answers[step]} onChange={setAnswer}/>
  <div className="assessment-actions">
   <button className="assessment-secondary" onClick={()=>setStep(v=>Math.max(0,v-1))} disabled={step===0}>Back</button>
   <button className="assessment-primary" disabled={answers[step]===undefined} onClick={()=>step===15?finish():setStep(v=>v+1)}>{step===15?"Continue to Sleep Check":"Next"} <ArrowRight size={16}/></button>
  </div>
 </section>:null}
 </Shell>;
}
export function SleepCheckPage(){
 const navigate=useNavigate();
 const [answers,setAnswers]=useState(()=>mindCheckSession.isiAnswers||{}),[stressAnswers,setStressAnswers]=useState(()=>mindCheckSession.pssAnswers||{});
 const [profile,setProfile]=useState(()=>mindCheckSession.profile||{age:"",gender:"",edu:"",smoke:"",drink:""});
 const [skipMl,setSkipMl]=useState(Boolean(mindCheckSession.skipMl)),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const [apiResult,setApiResult]=useState(null),[showSafety,setShowSafety]=useState(false),[showSummary,setShowSummary]=useState(false);
 const [bedtime,setBedtime]=useState("23:00"),[wakeTime,setWakeTime]=useState("07:00");
 const sleepHours=(()=>{const [bh,bm]=bedtime.split(":").map(Number),[wh,wm]=wakeTime.split(":").map(Number);let mins=(wh*60+wm)-(bh*60+bm);if(mins<=0)mins+=1440;return `${Math.floor(mins/60)}h ${mins%60}m`;})();
 const isiComplete=isi.every(q=>answers[q.name]!==undefined);
 const pssComplete=stressQuestions.every(q=>stressAnswers[q.name]!==undefined);
 const age=Number(profile.age),ageInRange=Number.isInteger(age)&&age>=16&&age<=40;
 const profileComplete=ageInRange&&["gender","edu","smoke","drink"].every(key=>Boolean(profile[key]));
 const canSubmit=Boolean(mindCheckSession.phq9Answers)&&isiComplete&&pssComplete&&(skipMl||age<16||age>40||profileComplete);
 const updateProfile=(key,value)=>setProfile(current=>{const next={...current,[key]:value};mindCheckSession.profile=next;return next;});
 const clearAll=()=>{mindCheckSession.phq9Answers=null;mindCheckSession.phq9Draft={};mindCheckSession.isiAnswers={};mindCheckSession.pssAnswers={};mindCheckSession.profile={age:"",gender:"",edu:"",smoke:"",drink:""};mindCheckSession.skipMl=false;setAnswers({});setStressAnswers({});setProfile({age:"",gender:"",edu:"",smoke:"",drink:""});setSkipMl(false);setApiResult(null);setShowSafety(false);setShowSummary(false);setError("");};
 const sendRequest=async(payload)=>{
  let lastError=null;
  for(let attempt=0;attempt<2;attempt++){
   const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),90000);
   try{
    const response=await fetch("https://mindcheck-api.onrender.com/api/screen",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:controller.signal});
    let data=null;try{data=await response.json();}catch{data=null;}
    if(!response.ok)throw new Error("The screening service could not process these answers.");
    if(!data||!data.phq9||!data.gad7)throw new Error("The screening service returned an incomplete result.");
    return data;
   }catch(err){lastError=err;}
   finally{clearTimeout(timeout);}
  }
  throw lastError||new Error("The screening service is temporarily unavailable.");
 };
 const submit=async()=>{
  if(!canSubmit||loading)return;
  setLoading(true);setError("");setApiResult(null);setShowSafety(false);setShowSummary(false);
  const payload={
   phq9_answers:mindCheckSession.phq9Answers.slice(0,9).map(Number),
   gad7_answers:mindCheckSession.phq9Answers.slice(9,16).map(Number)
  };
  if(!skipMl&&ageInRange&&profileComplete){
   payload.ml_inputs={
    isi_answers:isi.map(q=>Number(answers[q.name])),
    pss_answers:stressQuestions.map(q=>Number(stressAnswers[q.name])),
    age,gender:profile.gender,edu:profile.edu,smoke:profile.smoke,drink:profile.drink
   };
  }
  try{
   const data=await sendRequest(payload);setApiResult(data);
   if(data?.safety?.show_support===true)setShowSafety(true);else setShowSummary(true);
   mindCheckSession.phq9Answers=null;
  }catch(err){
   setError(err?.name==="AbortError"?"The screening service took too long. Your answers are still here — please try again.":"We couldn’t complete your screening right now. Your answers are still here — please try again in a moment.");
  }finally{setLoading(false);}
 };
 const resetToWellbeing=()=>{navigate("/wellbeing-checkin");};
 return <Shell eyebrow="REST & RECOVERY" title="How has your sleep been?" subtitle="Complete your sleep and stress reflections to receive your combined screening results." icon={Moon}>
  <div className="dream-lab-intro"><div className="dream-lab-copy"><span className="overview-kicker">THE DREAM LAB</span><h2>Build a picture of your nights.</h2><p>Sleep is more than a number. Explore your rhythm, then reflect on what may be interrupting your rest.</p></div><div className="dream-window"><span>☾</span><i>✦</i><b>REST<br/>MODE</b></div></div>
  <div className="sleep-rhythm-panel"><div className="sleep-rhythm-head"><div><span className="overview-kicker">YOUR SLEEP RHYTHM</span><h3>A night, mapped by you</h3></div><strong>{sleepHours}<small> in bed</small></strong></div><div className="sleep-clock-track"><span className="sleep-clock-fill"/></div><div className="sleep-time-controls"><label>Bedtime<input type="time" value={bedtime} onChange={e=>setBedtime(e.target.value)}/></label><span className="sleep-path">→</span><label>Wake-up<input type="time" value={wakeTime} onChange={e=>setWakeTime(e.target.value)}/></label></div><p>Move the times to sketch your usual sleep window. This is a reflection aid, not a sleep measurement.</p></div>
  {!mindCheckSession.phq9Answers?<div className="assessment-panel mindcheck-prerequisite"><h2>Start with your Wellbeing Check-in</h2><p>Complete the 16 PHQ-9 and GAD-7 questions first. Your answers will stay in this active session until the final submission.</p><button className="assessment-primary" onClick={resetToWellbeing}>Go to Wellbeing Check-in <ArrowRight size={16}/></button></div>:null}
  <div className="sleep-overview"><div><span className="overview-kicker">YOUR NIGHTLY RESET</span><strong>{isi.filter(q=>answers[q.name]!==undefined).length}<small> / 7</small></strong><p>sleep reflections completed</p></div><div className="sleep-moon">☾<span>✦</span></div><div className="sleep-overview-track"><span style={{width:(isi.filter(q=>answers[q.name]!==undefined).length/7*100)+"%"}}/></div></div>
  <div className="assessment-panel">
   <div className="assessment-section-intro"><span className="section-number">01</span><div><span className="overview-kicker">SLEEP REFLECTION · ISI</span><h2>Your sleep</h2></div></div>
   <p className="assessment-muted">Think about the last 2 weeks. For the first three questions, rate the severity of your sleep difficulties.</p>
   {isi.map((q,i)=><fieldset className="assessment-fieldset" key={q.name}><legend>{i+1}. {q.text}</legend><ClinicalOptions options={q.opts} value={answers[q.name]} onChange={v=>setAnswers(current=>{const next={...current,[q.name]:v};mindCheckSession.isiAnswers=next;return next;})}/></fieldset>)}
   <p className="mindcheck-copyright">Insomnia Severity Index © Morin, C.M. Permission must be obtained before public launch.</p>
   <div className="assessment-section-intro assessment-stress-intro"><span className="section-number">02</span><div><span className="overview-kicker">STRESS REFLECTION · PSS-14</span><h2>Your stress</h2></div></div>
   <p className="assessment-muted">In the last month, how often have you felt or thought this way? Please answer fairly quickly; your first reasonable estimate is enough.</p>
   {stressQuestions.map((q,i)=><fieldset className="assessment-fieldset" key={q.name}><legend>{i+1}. {q.text}</legend><ClinicalOptions options={stressScale} value={stressAnswers[q.name]===undefined?undefined:stressAnswers[q.name]-1} offset={1} onChange={v=>setStressAnswers(current=>{const next={...current,[q.name]:v};mindCheckSession.pssAnswers=next;return next;})}/></fieldset>)}
   <div className="sleep-stress-progress">{stressQuestions.filter(q=>stressAnswers[q.name]!==undefined).length} / 14 stress reflections completed</div>
   <div className="assessment-section-intro"><span className="section-number">03</span><div><span className="overview-kicker">ABOUT YOU</span><h2>A little context</h2></div></div>
   <p className="assessment-muted">These five details are used only for the optional experimental insight. If you prefer not to share them, you can continue without the ML insight.</p>
   <div className="assessment-profile-grid mindcheck-profile-grid">
    <label>Age (16–40)<input type="number" min="16" max="40" value={profile.age} onChange={e=>updateProfile("age",e.target.value)} placeholder="Enter your age"/></label>
    <label>Gender<select value={profile.gender} onChange={e=>updateProfile("gender",e.target.value)}><option value="">Choose</option><option value="female">Female</option><option value="male">Male</option></select></label>
    <label>Education<select value={profile.edu} onChange={e=>updateProfile("edu",e.target.value)}><option value="">Choose</option><option value="associate">Associate</option><option value="bachelor">Bachelor</option><option value="master">Master</option><option value="doctorate">Doctorate</option></select></label>
    <label>Smoking<select value={profile.smoke} onChange={e=>updateProfile("smoke",e.target.value)}><option value="">Choose</option><option value="never">Never</option><option value="occasional">Occasional</option><option value="former">Former</option><option value="current">Current</option></select></label>
    <label>Drinking<select value={profile.drink} onChange={e=>updateProfile("drink",e.target.value)}><option value="">Choose</option><option value="never">Never</option><option value="occasional">Occasional</option><option value="past">Past</option><option value="regular">Regular</option></select></label>
   </div>
   <label className="mindcheck-skip-ml"><input type="checkbox" checked={skipMl} onChange={e=>{setSkipMl(e.target.checked);mindCheckSession.skipMl=e.target.checked;}}/> I prefer not to share these details. Continue without the experimental ML insight.</label>
   {!skipMl&&profile.age&&!ageInRange?<p className="assessment-muted">The experimental insight is available only for ages 16–40. You can continue with the questionnaire results without it.</p>:null}
   <div className="assessment-actions">
    <button type="button" className="assessment-secondary" onClick={clearAll}>Clear answers</button>
    <button type="button" className="assessment-primary" disabled={!canSubmit||loading} onClick={submit}>{loading?"Preparing your results…":"Submit complete check-in"} <ArrowRight size={16}/></button>
   </div>
   {loading?<p className="mindcheck-loading" role="status">Connecting to the screening service. The first request may take up to 90 seconds. If it fails, we’ll retry once automatically.</p>:null}
   {error?<p className="assessment-error" role="alert"><AlertCircle size={16}/><span>{error}</span></p>:null}
   {showSafety&&apiResult?<section className="assessment-safety mindcheck-safety" aria-live="polite" style={{background:"#49372f",backgroundImage:"none",border:"1px solid #8b654d",color:"#fff3df"}}><h3 style={{color:"#fff3df",WebkitTextFillColor:"#fff3df",opacity:1}}>You don’t have to handle this alone</h3><p style={{color:"#fff3df",WebkitTextFillColor:"#fff3df",opacity:1}}>One of your answers suggests you may have had thoughts of hurting yourself. These thoughts can be difficult to carry. Consider reaching out to someone you trust or a qualified mental health professional.</p><p style={{color:"#fff3df",WebkitTextFillColor:"#fff3df",opacity:1}}>If you are in immediate danger, contact local emergency services now.</p><button type="button" className="assessment-primary" onClick={()=>{setShowSafety(false);setShowSummary(true);}}>Continue to my results <ArrowRight size={16}/></button></section>:null}
   {showSummary&&apiResult?<section className="assessment-sleep-result mindcheck-results" aria-live="polite">
    <span className="assessment-success"><CheckCircle2 size={18}/> Your MindCheck results</span>
    <div className="assessment-result-grid">
     <article><span>Mood · PHQ-9</span><strong>{apiResult.phq9.score} <small>/ {apiResult.phq9.max_score}</small></strong><b>{apiResult.phq9.level}</b></article>
     <article><span>Worry · GAD-7</span><strong>{apiResult.gad7.score} <small>/ {apiResult.gad7.max_score}</small></strong><b>{apiResult.gad7.level}</b></article>
    </div>
    {apiResult.ml?.available===true?<div className="mindcheck-ml-card"><span>EXTRA INSIGHT · EXPERIMENTAL</span><div><b>Depression model</b><strong>{apiResult.ml.depression?.risk_score!=null?Number(apiResult.ml.depression.risk_score).toFixed(1):"—"} / 100</strong><p>{apiResult.ml.depression?.alert===true?"A check-in may help":"No flag"}</p></div><div><b>Anxiety model</b><strong>{apiResult.ml.anxiety?.risk_score!=null?Number(apiResult.ml.anxiety.risk_score).toFixed(1):"—"} / 100</strong><p>{apiResult.ml.anxiety?.alert===true?"A check-in may help":"No flag"}</p></div><small>These are experimental model scores, not probabilities or diagnoses.</small></div>:null}
    <p className="assessment-disclaimer">{apiResult.disclaimer||"This is a screening result, not a diagnosis. Only a qualified mental health professional can diagnose or treat."}</p>
    <div className="assessment-actions"><button type="button" className="assessment-secondary" onClick={clearAll}><RotateCcw size={15}/> Start again</button><button type="button" className="assessment-primary" onClick={()=>navigate("/mindora-ai")}>Explore coping suggestions <ArrowRight size={16}/></button></div>
   </section>:null}
  </div>
 </Shell>;
}
export function AcademicStressPage(){
 const [values,setValues]=useState({}),[result,setResult]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 const all=academicGroups.flatMap(g=>g.items),complete=all.every(([name])=>Object.prototype.hasOwnProperty.call(values,name)); const [language]=useLanguage(); const hi=language==="hi";
 const clear=()=>{setValues({});setResult(null);setError("");};
 const submit=async e=>{
  e.preventDefault(); if(!complete)return;
  setLoading(true);setError("");setResult(null);
  const payload=Object.fromEntries(all.map(([name])=>[name,Number(values[name])]));
  try{
   const response=await fetch("https://academic-stress-pattern-predictor3.onrender.com/api/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   let data={};try{data=await response.json();}catch{data={};}
   if(!response.ok){
    const details=data?.details;
    const detailMessage=Array.isArray(details)?details.map(item=>typeof item==="string"?item:item?.msg||item?.message||JSON.stringify(item)).join(" · "):typeof details==="string"?details:details&&typeof details==="object"?Object.entries(details).map(([key,value])=>key+": "+(Array.isArray(value)?value.join(", "):String(value))).join(" · "):"";
    throw new Error(detailMessage||data?.message||data?.error||"The predictor could not validate your answers. Please check all 16 responses and try again.");
   }
   if(!data?.level)throw new Error("The predictor response was incomplete. Please try again.");
   setResult(data);
  }catch(err){setError(err.message||"Could not connect to the predictor. Please try again later.");}
  finally{setLoading(false);}
 };
 const levelKey=String(result?.level||"").toLowerCase();
 const levelLabel=levelKey==="low"?"Low":levelKey==="moderate"?"Moderate":levelKey==="high"?"High":String(result?.level||"");
 return <Shell eyebrow="STUDY, SLEEP & SURROUNDINGS" title="Academic Stress Pattern Predictor" subtitle="Answer 16 short questions to see which patterns may be associated with your self-reported stress." icon={BookOpen}>
 <form className="assessment-panel academic-form" onSubmit={submit}>
  <div className="student-observatory"><div className="observatory-copy"><span className="overview-kicker">THE STUDENT OBSERVATORY</span><h2>Your life is more than your deadlines.</h2><p>Let’s look at the different forces around your study life — workload, energy, people and your environment.</p><div className="observatory-tags"><span>01 · Study</span><span>02 · Body</span><span>03 · People</span><span>04 · Space</span></div></div><div className="stress-orbit"><div className="stress-orbit-ring"/><span>YOUR<br/>BALANCE</span><i>✦</i><b>◌</b></div></div>
  <div className="academic-overview"><div><span className="overview-kicker">STUDENT WELLBEING SNAPSHOT</span><h2>Let’s understand your study-life balance.</h2><p className="assessment-muted">A few honest answers can help highlight where pressure may be building.</p></div><div className="academic-count"><strong>{Object.keys(values).length}<small>/16</small></strong><span>answered</span></div><div className="academic-track"><span style={{width:(Object.keys(values).length/16*100)+"%"}}/></div></div>
  <p className="assessment-muted">All 16 questions are required. Choose the option that fits best.</p>
  {academicGroups.map((group,groupIndex)=><fieldset className="assessment-fieldset academic-group" key={group.title}><legend><span className="academic-chapter">{String(groupIndex+1).padStart(2,"0")}</span><span>{tr(group.title,hi)}</span></legend><div className="assessment-profile-grid">{group.items.map(([name,label,opts])=><label key={name}>{tr(label,hi)}<select required value={values[name]??""} onChange={e=>{setValues(v=>({...v,[name]:e.target.value}));setError("");setResult(null);}}><option value="" disabled>{hi?"चुनें":"Choose"}</option>{opts.map(option=>{const numericValue=Number(option.split(" - ")[0]);return <option value={numericValue} key={numericValue}>{tr(option,hi)}</option>;})}</select></label>)}</div></fieldset>)}
  <div className="assessment-actions"><button type="button" className="assessment-secondary" onClick={clear}>{hi?"जवाब मिटाएँ":"Clear answers"}</button><button className="assessment-primary" disabled={!complete||loading}>{loading?(hi?"जाँच हो रही है…":"Checking…"):(hi?"परिणाम देखें":"See my result")} <ArrowRight size={16}/></button></div>
  {error?<p className="assessment-error" role="alert"><AlertCircle size={16}/><span>{error}</span></p>:null}
  {result?<section className="assessment-academic-result" aria-live="polite">
   <span className="assessment-success"><CheckCircle2 size={18}/> {hi?"आपका परिणाम":"Your pattern summary"}</span>
   <div className="academic-result-level"><span>{hi?"तनाव का स्तर":"Stress level"}</span><h2>{levelLabel}</h2></div>
   <div className="academic-level-gauge" role="img" aria-label={"Stress level: "+levelLabel}>
    {["Low","Moderate","High"].map(level=><div key={level} className={"academic-level-segment"+(level===levelLabel?" is-active":"")}><span>{hi?(level==="Low"?"कम":level==="Moderate"?"मध्यम":"अधिक"):level}</span></div>)}
   </div>
   {Array.isArray(result.factors)&&result.factors.length>0?<div className="academic-factor-section"><b>{hi?"जुड़े हुए कारक":"Associated factors"}</b><div className="academic-factor-chips">{result.factors.map((factor,index)=><span className="academic-factor-chip" data-raw-api="true" key={index}>{String(factor)}</span>)}</div></div>:null}
   {result.message!=null?<p className="academic-api-message" data-raw-api="true">{String(result.message)}</p>:null}
   {result.disclaimer!=null?<p className="assessment-disclaimer academic-api-disclaimer" data-raw-api="true">{String(result.disclaimer)}</p>:null}
   {result.support_suggested===true?<div className="academic-support-link"><div><b>{hi?"किसी से बात करना मददगार हो सकता है":"Support is available"}</b><p>{hi?"अपने आसपास सहायता सेवाएँ खोजें।":"Explore confidential support options near you."}</p></div><a href="https://findahelpline.com/countries/in" target="_blank" rel="noreferrer">{hi?"अपने पास सहायता खोजें":"Find support near you"} <ArrowRight size={15}/></a></div>:null}
   <div className="assessment-actions academic-result-actions"><button type="button" className="assessment-primary" onClick={clear}><RotateCcw size={15}/>{hi?"फिर से प्रयास करें":"Try Again / Clear"}</button></div>
  </section>:null}
 </form>
 <p className="assessment-disclaimer assessment-outside-note">This student project highlights patterns in self-reported answers. It is not a diagnosis.</p>
 </Shell>;
}
