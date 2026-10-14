// A standard English stop word list used across the Preprocessing (Exp. 2),
// Stop Word Removal / Stemming / Lemmatization (Exp. 3) and Word Cloud / EDA
// (Exp. 10) modules.
export const STOPWORDS: ReadonlySet<string> = new Set(
  `a about above after again against all am an and any are aren't as at be
  because been before being below between both but by can't cannot could
  couldn't did didn't do does doesn't doing don't down during each few for
  from further had hadn't has hasn't have haven't having he he'd he'll he's
  her here here's hers herself him himself his how how's i i'd i'll i'm i've
  if in into is isn't it it's its itself let's me more most mustn't my
  myself no nor not of off on once only or other ought our ours ourselves
  out over own same shan't she she'd she'll she's should shouldn't so some
  such than that that's the their theirs them themselves then there there's
  these they they'd they'll they're they've this those through to too under
  until up very was wasn't we we'd we'll we're we've were weren't what
  what's when when's where where's which while who who's whom why why's
  with won't would wouldn't you you'd you'll you're you've your yours
  yourself yourselves this that these those is are was were be been being
  also`
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean),
);

export const HINDI_STOPWORDS: ReadonlySet<string> = new Set(
  `अत अपना अपनी अपने अभी अंदर आदि आप इनका इनकी इनके इन्होंने इन्हें इस इसका इसकी इसके इसमें इसी इसे उन उनका उनकी उनके उनमें उन्हीं उन्हें उस उसका उसकी उसके उसमें उसी उसे एक एवं ऐसे और कई कर करता करती करते करना करने करें कहते का काफी कि किया किसे किसी की कुछ कुल के को कोई कौन गया जब जहां जा जाता जाती जाते जाना जारी जो ज्यादा तक तब तरह तो था थी थे दिया दूसरा दूसरे दो द्वारा न नहीं ना नीचे ने पहले फिर बहुत बाद भी मगर में यदि यह यहाँ यही या ये रहा रही रहे लिए लिया ले लेकर व वह वही हुआ हुई हुए हैं है हो होता होती होते होना होने`
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean),
);

export const MARATHI_STOPWORDS: ReadonlySet<string> = new Set(
  `आहे आहेत नाही आणि व च्या ची चे चा मध्ये या त्या हे ती तो ते मला तुला त्याला तिला आम्ही तुम्ही आपण स्वतः करून झाला झाली झाले केले केली मुळे साठी कडे वरून वर खाली पण परंतु जर तर एक काय कसा कसे कशी अशी असे अशा सर्व खूप काही होते होती होता नसून असून अथवा किंवा पर्यंत देखील सुद्धा मात्र तेव्हा आता येथे तिथे जिथे जेव्हा केवळ जसे तसे जितके तितके प्रत्येक इतर कोणताही कोणती कोणते कोणत्या एका`
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean),
);

export function isStopword(word: string): boolean {
  const lower = word.toLowerCase();
  return STOPWORDS.has(lower) || HINDI_STOPWORDS.has(lower) || MARATHI_STOPWORDS.has(lower);
}
