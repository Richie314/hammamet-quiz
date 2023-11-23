const quizContainer = document.getElementById("container");
const countOfQuestion = document.querySelector(".number-of-question");
const displayContainer = document.getElementById("display-container");
const scoreContainer = document.querySelector(".score-container");
const nextBtn = document.getElementById('next-button');
const restart = document.getElementById("restart");
const userScore = document.getElementById("user-score");
const startScreen = document.querySelector(".start-screen");
const startButton = document.getElementById("start-button");
var questionCount = 0;
var scoreCount = { };
const colors = ['red', 'green', 'green', 'blue', 'blue', 'violet', 'violet', 'violet', 'orange', 'orange'];

var quizArray = [];
var lines = { };
var audio = { };

restart.addEventListener("click", () => {
    initial();
    displayContainer.classList.remove("hide");
    scoreContainer.classList.add("hide");
});

function displayNext() 
{
    nextBtn.disabled = false;
    
    questionCount++;
    
    if (questionCount == quizArray.length) {
        
        displayContainer.classList.add("hide");
        scoreContainer.classList.remove("hide");
        
        show_result();
        return;
    }
    if (questionCount === quizArray.length - 1)
    {
        nextBtn.innerHTML = 'Fine';
    }
    
    countOfQuestion.innerHTML =
        questionCount + 1 + " di " + quizArray.length;
        
    quizDisplay(questionCount);
}
nextBtn.addEventListener("click", displayNext);

const quizDisplay = (questionCount) => {
    let quizCards = document.querySelectorAll(".container-mid");
    
    quizCards.forEach((card) => {
        card.classList.add("hide");
    });
    
    quizCards[questionCount].classList.remove("hide");
};

function quizCreator() {
    
    quizArray.sort(() => Math.random() - 0.5);
    
    for (let i of quizArray) {
         
        i.options.sort(() => Math.random() - 0.5);
           
        let div = document.createElement("div");
        div.classList.add("container-mid", "hide");
        
        countOfQuestion.innerHTML = 1 + " di " + quizArray.length;
        
        let question_DIV = document.createElement("p");
        question_DIV.classList.add("question");
        question_DIV.innerHTML = i.question;
        div.appendChild(question_DIV);
        //options
        for (const option of i.options)
        {
            const o = document.createElement('button');
            o.className = 'option-div';
            o.onclick = () => checker(option, o, div);
            o.innerHTML = option.label;
            div.appendChild(o);
        }
        quizContainer.appendChild(div);
    }
}

function checker(option, button, question) {
    //console.log(option, question);
    let options = question.querySelectorAll(".option-div");
    let correct = false;
    nextBtn.disabled = true;
    if ('points' in option) {
        for (const [target, score] of Object.entries(option.points))
        {
            if (!isNaN(score) || !target)
            {
                if (!(target in scoreCount))
                {
                    scoreCount[target] = 0;
                }
                scoreCount[target] += score;
                correct = true;
            }
        }
        
    }
    if (correct)
    {
        const rand_index = Math.floor(Math.random() * colors.length);
        console.log(rand_index, colors.length);
        button.classList.add(colors[rand_index]);
    }
    options.forEach((element) => {
        element.disabled = true;
    });
    setTimeout(displayNext, 750);
}

function initial()
{
    quizContainer.innerHTML = "";
    questionCount = 0;
    scoreCount = {};
    nextBtn.innerHTML = 'Salta';
    quizCreator();
    quizDisplay(questionCount);
}

function show_result()
{
    //console.log(scoreCount)
    let max = -1;
    for (const [alliev, score] of Object.entries(scoreCount))
    {
        if (score > max)
        {
            max = score;
        }
    }
    if (isNaN(max)) return;
    if (max <= 0)
    {
        userScore.innerHTML = '<strong>Non sei adatto ad Hammamet!</strong><br>'
        return;
    }
    let allievs = []
    for (const [alliev, score] of Object.entries(scoreCount))
    {
        if (score === max)
        {
            allievs.push(alliev);
        }
    }
    if (allievs.length === 1) {
        userScore.innerHTML = '<span style="text-align: center;">Il tuo Hammamettiano &egrave; ' + allievs[0] + '</span>';
    } else {
        userScore.innerHTML = '<span style="text-align: center;">I tuoi Hammamettiani sono ' + allievs.join(', ') + '</span>';
    }
    for (const alliev of allievs)
    {
        const img  = document.createElement('img');
        //const br = document.createElement('br');
        img.src = 'images/' + alliev + '.jpg';
        img.title = alliev;
        img.alt = alliev;
        img.style.width = '90%';
        img.style.marginInline = 'auto';
        img.style.aspectRatio = '1';
        img.style.maxWidth = '9em';
        //userScore.appendChild(br);
        userScore.appendChild(img);
        if (alliev in lines)
        {
            //const br2 = document.createElement('br');
            const p = document.createElement('p');
            p.innerText = lines[alliev];
            p.style.userSelect = 'none';
            p.style.width = '85%';
            p.style.marginInline = 'auto';
            //userScore.appendChild(br2);
            userScore.appendChild(p);
        }
        if (alliev in audio)
        {
            //const br3 = document.createElement('br');
            const track = document.createElement('audio');
            track.autoplay = true;
            track.controls = true;
            track.hidden = false;
            track.style.width = '100%';
            track.style.height = 'fit-content';
            track.src = audio[alliev];
            //userScore.appendChild(br3);
            userScore.appendChild(track);
        }
    }
    if (navigator.share)
    {
        //const br = document.createElement('br');
        //userScore.appendChild(br);
        const a = document.createElement('a');
        a.onclick = () => {
            const data = {
                title: 'Fai anche tu il quiz su che Hammamettiano sei!',
                url: window.location.toString(),
                text: 'Io ho ottenuto ' + allievs.join(', ') + '!'
            }
            if (navigator.canShare(data))
            navigator.share(data)
        }
        a.innerText = 'Condividi il risultato';
        a.title = 'Clicca per condividere';
        a.className = 'share';
        userScore.appendChild(a);
    }
    
}

startButton.addEventListener("click", () => {
    startScreen.classList.add("hide");
    displayContainer.classList.remove("hide");
    initial();
});

async function LoadComponents()
{
    // Domande
    const res1 = await fetch('./json/questions.json');
    if (!res1.ok)
    {
        alert('È avvenuto un errore: impossibile caricare le domande!');
        return;
    }
    quizArray = await res1.json();

    // Battute
    const res2 = await fetch('./json/lines.json');
    if (!res2.ok)
    {
        alert('È avvenuto un errore: impossibile caricare i risultati!');
        return;
    }
    lines = await res2.json();

    // Audio
    const res3 = await fetch('./json/audio.json');
    if (!res3.ok)
    {
        alert('È avvenuto un errore: impossibile caricare gli audio!');
        return;
    }
    audio = await res3.json();
}
LoadComponents().then(() => {
    startScreen.classList.remove("hide");
    displayContainer.classList.add("hide");
});