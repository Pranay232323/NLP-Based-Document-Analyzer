async function test() {
  const text = `जीवन में हमेशा खुश रहना चाहिए, क्योंकि हर दिन एक नई शुरुआत लेकर आता है।
मुश्किलें चाहे कितनी भी आएँ, हमें कभी हार नहीं माननी चाहिए।
अपने सपनों को पूरा करने के लिए मेहनत और लगन बहुत ज़रूरी है।
हमेशा दूसरों की मदद करें और सबका सम्मान करें।
समय की कदर करें, क्योंकि बीता हुआ समय कभी वापस नहीं आता।
खुद पर विश्वास रखें और आगे बढ़ते रहें।
क्योंकि मेहनत करने वालों की कभी हार नहीं होती।`;

  try {
    const res = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, docName: "Test" }),
    });
    console.log("Status:", res.status, res.headers.get("content-type"));
    const textRes = await res.text();
    console.log("Body snippet:", textRes.slice(0, 500));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

test();
