//selecting all required elements
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
let questions = {};//modified API Data in JSON
let APIData={};// Original API Data
const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");
let timeValue =  20;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;


const quit_quiz = result_box.querySelector(".buttons .quit");

document.getElementById('registration-form')?.addEventListener('submit', function(event) {
    event.preventDefault();

    let userName = document.getElementById('user-name').value;

    let email = document.getElementById('email').value;

    let numberOfQuestions = document.getElementById('number-question').value;

    let level = document.querySelector('input[name="level"]:checked');

    let questionCategory = document.querySelector('input[name="category"]:checked');

    // Check if User Name is empty
    if (!userName.trim()) {

      displayError(new Error('User Name must not be empty.'));

      return;

    }
    // Check if Email is empty
    if (!email.trim()) {

      displayError(new Error('Email must not be empty.'));

      return;

    }
    if (!isValidEmail(email)) {

      displayError(new Error('Please enter a valid email address.'));

      return;

    }

    if (!questionCategory) {

      displayError(new Error('Please select a category.'));

      return;

    }

    if (!numberOfQuestions || numberOfQuestions < 5) {

      displayError(new Error('Please select at least 5 questions.'));


      numberOfQuestions.value = '';

      return;

    }

    if (!level) {

      displayError(new Error('Please select a difficulty level.'));

      return;

    }

    fetch('https://opentdb.com/api.php?amount='+ numberOfQuestions + ' &category= ' + questionCategory.value + '&difficulty=' + level.value +'&type=' + 'multiple')
    .then(function(response) {
        console.log(response);
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();

    })
    .then(function(data) {
        console.log(data);
        modifyAPIData(data.results);
        console.log("questions", questions);
        info_box.classList.remove("activeInfo"); //hide info box
        quiz_box.classList.add("activeQuiz"); //show quiz box
        showQuetions(0); //calling showQestions function
        queCounter(1); //passing 1 parameter to queCounter
        startTimer(20); //calling startTimer function
        startTimerLine(0); //calling startTimerLine function
    })

    .catch(function(error) {
        displayError(error);
    });

    

});

function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);

  }

function displayError(error) {

    console.log(error);
    let errorMsg = 'Error: ' + error.message;
    alert(errorMsg);
}


// if startQuiz button clicked
start_btn.onclick = ()=>{
    info_box.classList.add("activeInfo"); //show info box
}
// if quitQuiz button clicked
quit_quiz.onclick = ()=>{
    window.location.reload(); //reload the current window
}



// if Next Que button clicked
next_btn.onclick = ()=>{
    if(que_count < questions.length - 1){ //if question count is less than total question length
        que_count++; //increment the que_count value
        que_numb++; //increment the que_numb value
        showQuetions(que_count); //calling showQestions function
        queCounter(que_numb); //passing que_numb value to queCounter
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        startTimer(timeValue); //calling startTimer function
        startTimerLine(widthValue); //calling startTimerLine function
        timeText.textContent = "Time Left"; //change the timeText to Time Left
        next_btn.classList.remove("show"); //hide the next button
    }else{
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        showResult(); //calling showResult function
    }
}

// getting questions and options from array
function showQuetions(index){
    console.log('log',questions);
    const que_text = document.querySelector(".que_text");

    //creating a new span and div tag for question and option and passing the value using array index
    let que_tag = '<span>'+ (index+1) + ". " + questions[index].question +'</span>';
    let option_tag = '<div class="option"><span>'+ questions[index].options[0] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[1] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[2] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[3] +'</span></div>';
    que_text.innerHTML = que_tag; //adding new span tag inside que_tag
    option_list.innerHTML = option_tag; //adding new div tag inside option_tag
    
    const option = option_list.querySelectorAll(".option");

    // set onclick attribute to all available options
    for(i=0; i < option.length; i++){
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}
// creating the new div tags which for icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

//if user clicked on option
function optionSelected(answer){
    clearInterval(counter); //clear counter
    clearInterval(counterLine); //clear counterLine
    let userAns = normalizeString(answer.textContent); //getting user selected option
    let correcAns = normalizeString(questions[que_count].answer); //getting correct answer from array . Normalizing string to account for right measurement.
    const allOptions = option_list.children.length; //getting all option items
    
    if(userAns == correcAns){ //if user selected option is equal to array's correct answer
        userScore += 1; //upgrading score value with 1
        answer.classList.add("correct"); //adding green color to correct selected option
        
        console.log("Your correct answers = " + userScore);
    }else{
        answer.classList.add("incorrect"); //adding red color to correct selected option
        answer.insertAdjacentHTML("beforeend", crossIconTag); //adding cross icon to correct selected option
        for(i=0; i < allOptions; i++){
            let modOption = option_list.children[i].textContent.toLowerCase();
            if(modOption == correcAns){ //if there is an option which is matched to an array answer 
                option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                
                console.log("Auto selected correct answer.");
            }
        }
    }
    for(i=0; i < allOptions; i++){
        option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
    }
    next_btn.classList.add("show"); //show the next button if user selected any option
}

function showResult(){
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.remove("activeQuiz"); //hide quiz box
    result_box.classList.add("activeResult"); //show result box
    const scoreText = result_box.querySelector(".score_text");
    if (userScore > 3){ // if user scored more than 3
        //creating a new span tag and passing the user score number and total question number
        let scoreTag = '<span>Congrats! 🎉, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;  //adding new span tag inside score_Text
    }
    else if(userScore > 1){ // if user scored more than 1
        let scoreTag = '<span>Nice 😎, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;
    }
    else{ // if user scored less than 1
        let scoreTag = '<span>Sorry 😐, You got only <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        scoreText.innerHTML = scoreTag;
    }
}

function startTimer(time){
    counter = setInterval(timer, 1000);
    function timer(){
        timeCount.textContent = time; 
        time--; 
        if(time < 9){ 
            let addZero = timeCount.textContent; 
            timeCount.textContent = "0" + addZero; 
        }
        if(time < 0){ 
            clearInterval(counter);
            timeText.textContent = "Time Off";
            const allOptions = option_list.children.length; 
            let correcAns = questions[que_count].answer; 
            for(i=0; i < allOptions; i++){
                if(option_list.children[i].textContent == correcAns){ 
                    option_list.children[i].setAttribute("class", "option correct"); 
                    console.log("Time Off: Auto selected correct answer.");
                }
            }
            for(i=0; i < allOptions; i++){
                option_list.children[i].classList.add("disabled"); 
            }
            next_btn.classList.add("show"); 
        }
    }
}

function startTimerLine(time){
    counterLine = setInterval(timer, 29);
    function timer(){
        time += 0.75; //upgrading time value with 1
        time_line.style.width = time + "px"; //increasing width of time_line with px by time value
        if(time > 549){ //if time value is greater than 549
            clearInterval(counterLine); //clear counterLine
        }
    }
}

function queCounter(index){
    //creating a new span tag and passing the question number and total question
    let totalQueCounTag = '<span><p>'+ index +'</p> of <p>'+ questions.length +'</p> Questions</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;  //adding new span tag inside bottom_ques_counter
}

function modifyAPIData(unmodQues){
    console.log("hello", unmodQues);
    let newModQues=unmodQues.map((set,index)=>{
        let setIncorrect_ans=set.incorrect_answers;
        let setCorrect_ans=set.correct_answer;
        let optionsArray= Object.values({...setIncorrect_ans,setCorrect_ans});// making an array of all the options
        shuffleArray(optionsArray); // shuffling the options
        return{
            "numb":index+1,
            "question":set.question,
            "answer":set.correct_answer,
            "options": optionsArray

        };
    });
    console.log(newModQues);
    questions=newModQues;
}

function shuffleArray(array) //shuffling options using Fisher - Yates Algorithm
{
    console.log(array);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Generate a random index
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

function normalizeString(input) {
    const entityMapping = {
        '&039;': "'", // Apostrophe
        '&lt;': '<', // Less than
        '&gt;': '>', // Greater than

    };

    for (const entity in entityMapping) {
        if (entityMapping.hasOwnProperty(entity)) {
            const character = entityMapping[entity];
            const entityRegExp = new RegExp(entity, 'g');
            input = input.replace(entityRegExp, character);
        }
    }

    return input.toLowerCase();
}   