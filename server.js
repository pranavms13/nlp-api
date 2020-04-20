const express = require("express");
const bodyParser = require("body-parser");

const fs = require('fs');
let rawdata = fs.readFileSync('./sets/en.json');
let traindata = JSON.parse(rawdata);

const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'] });

traindata.data.forEach(r => {
    r.utterances.forEach(utt => {
        manager.addDocument(traindata.lang,utt,r.intent)
    });
    r.answers.forEach(ans => {
        manager.addAnswer(traindata.lang,r.intent,ans)
    });
});

(async() => {
    await manager.train();
    manager.save();
})();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log("Server Running Live on Port : " + port);
});

app.get('/', async (req,res) => {
    var data = req.body.data;
    const response = await manager.process('en', data);
    res.send({answer:response.answer});
});