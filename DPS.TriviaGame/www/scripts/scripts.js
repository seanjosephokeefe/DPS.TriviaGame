/**
Utility IQ Challenge developed for the NYS Department of Public Service
Dan Carpenter and Tim Saxe, 6/30/2015
updated and enhanced by Bhargav Sidda 7/26/2016
*/

//declaring global variables
var numCorrect;  //keeps track of how many questions the user has correctly answered
var questionNumber;  //the total number of questions the user has been asked
var q;  //the current question being asked

//Set of variables that are initialized to 0 and changed to 1 to indicate that a question of 
//a specific category has been asked.

//Easy questions
var waterFound;
var elecFound;
var gasFound;
var phoneFound;
var miscFound;

//Hard questions
var hardWaterFound;
var hardElecFound;
var hardGasFound;
var hardPhoneFound;

var timer;  //timer variable for the "Still There?" popup after a user is inactive for 30s
var categoryTracker;  //used to tell LightUpCategoryIcon what the current question's category is
var audio;  //the audio file that is used on the CongratulationsScreen

DisableAnswerButtons();



/**
Invoked when the Play button is clicked.  Initializes variables and begins the game.
*/
$("#playButton").click(function () {

    $(".resetButton").hide();
    $(".continueButton").hide();
    $(".continueButton").css("opacity", "1");
    $(".showAttendant").hide();

    //hide all badges since the user hasn't earned any of them yet
    $(".waterbadge").hide();
    $(".electricitybadge").hide();
    $(".gasbadge").hide();
    $(".phonebadge").hide();

    //once the user clicks play the play button becomes disabled so that they can't click it again
    $("#playButton").prop("disabled", true);

    //makes sure that all the screens are bright, even if they had been dimmed previously
    $("#CorrectScreen").css("opacity", "1");
    $("#IncorrectScreen").css("opacity", "1");
    $("#CongratulationsScreen").css("opacity", "1");
    $("#SorryScreen").css("opacity", "1");

    //resets the congrats screen in preparation for the slide animation
    $(".congratstext").show();
    $(".nyPieces").css("top", "0");
    $(".fireworks").css("top", "0");
    $(".leftBadges").css("top", "0");
    $(".rightBadges").css("top", "0");

    //makes sure the banner at the bottom of the Correct and Incorrect screens is visible
    $(".pscfooter").show();

    //reset pieces of NYS so that they are dim at the start of a new game
    $(".nys1").css("opacity", "0.1");
    $(".nys2").css("opacity", "0.1");
    $(".nys3").css("opacity", "0.1");
    $(".nys4").css("opacity", "0.1");
    $(".nys4").css("opacity", "0.1");
    $(".nys5").css("opacity", "0.1");
    $(".nys6").css("opacity", "0.1");

    //when the user clicks play, the home screen fades out and the game screen fades in
    $("#HomeScreen").fadeOut();
    $("#MainGameScreen").fadeIn();

    //variable to keep track of how many questions the user has answered correctly
    numCorrect = 0;

    //these keep track of whether or not questions of a certain category have been used
    //so that the user gets at least one question from each category
    waterFound = 0;
    elecFound = 0;
    gasFound = 0;
    phoneFound = 0;
    miscFound = 0;
    hardWaterFound = 0;
    hardElecFound = 0;
    hardGasFound = 0;
    hardPhoneFound = 0;
    questionNumber = 0;

    //this starts the game
    SetUpQuestions();
    AskQuestion();
});



/**
While the user still has questions to answer, this function gets them a new question with SelectAndDisplayQuestion, 
fits the text, enables the answer buttons,and starts the timer.
*/
function AskQuestion() {
    q = SelectAndDisplayQuestion();
    EnableAnswerButtons();
    StartTimer();
}



/**
Calls GetQuestion to randomly get a question.  For the first five questions that the user gets,
1 is water, 1 is electric, 1 is gas, 1 is phone, and 1 is miscellaneous.  To make sure that the user
gets one of each category, the function keeps getting new questions until it has found a question that
has a category that has not yet been used.  After the first five questions, the remaining questions are
randomly chosen.  However, once the user gets 6 questions correct, the game gives them a difficult question
from each category.
*/
function SelectAndDisplayQuestion() {

    var localq;

    var keepSearching = true;

    //giving the user 1 water, 1 electric, 1 gas, 1 phone, 1 misc for the first 5 questions
    if (questionNumber < 5) {
        while (keepSearching == true) {
            //gets an unasked question
            localq = GetQuestion();

            if (localq.category == "water" && waterFound == 0) {
                keepSearching = false;
                waterFound = 1;
            }
            else if (localq.category == "elec" && elecFound == 0) {
                keepSearching = false;
                elecFound = 1;
            }
            else if (localq.category == "gas" && gasFound == 0) {
                keepSearching = false;
                gasFound = 1;
            }
            else if (localq.category == "tele" && phoneFound == 0) {
                keepSearching = false;
                phoneFound = 1;
            }
            else if (localq.category == "misc" && miscFound == 0) {
                keepSearching = false;
                miscFound = 1;
            }
        }
    }
        //giving the player one of each difficult question category
    else if (numCorrect > 5) {
        while (keepSearching == true) {
            //gets an unasked question
            localq = GetQuestion();

            //one difficult water question
            if (localq.category == "water" && hardWaterFound == 0) {
                keepSearching = false;
                hardWaterFound = 1;
            }
                //one difficult electricity question
            else if (localq.category == "elec" && hardElecFound == 0) {
                keepSearching = false;
                hardElecFound = 1;
            }
                //one difficult gas question
            else if (localq.category == "gas" && hardGasFound == 0) {
                keepSearching = false;
                hardGasFound = 1;
            }
                //one difficult phone question
            else if (localq.category == "tele" && hardPhoneFound == 0) {
                keepSearching = false;
                hardPhoneFound = 1;
            }
        }
    }
        //gets a random easy question
    else {
        //gets an unasked question
        localq = GetQuestion();
    }
    ArrangeAnswers(localq);

    //marks the question as used so that it won't be repeated
    localq.used = 1;

    //actually changing what appears within the question box
    $("#questionText").html(localq.question);
    FitText(localq);
    return localq;
}



/**
Before the user gets 6 questions correct, this function randomly selects and returns a question from the 
list of easy questions.  After the user gets at least 6 questions correct, this function randomly selects 
a question from the list of hard questions.
@return {object} Returns a question that has not already been asked.
*/
function GetQuestion() {
    //this variable becomes true when a question has been found
    var questionFound = false;

    //random number to randomly select a question
    var num;

    var question;

    while (questionFound == false) {
        //if they don't have at least 6 correct, they are playing with normal questions and don't earn badges
        if (numCorrect < 6) {
            //generate a random number
            num = Math.floor(Math.random() * questions.length);

            //based on the random number, we assign that associative array to the variable question
            //this is the actual question associated with the array entry in questions at position 'num'
            question = questions[num];

            if (question.used != 1) {
                questionFound = true;
            }
        }
        else {
            //generate a random number
            num = Math.floor(Math.random() * hardQuestions.length);

            //based on the random number, we assign that associative array to the variable question
            //this is the actual question associated with the array entry in questions at position 'num'
            question = hardQuestions[num];

            if (question.used != 1) {
                questionFound = true;
            }
        }
    }
    DimAllCategoryIcons();
    LightUpCategoryIcon(question);
    return question;
}



/**
Using the Shuffle function, this randomly arranges the answers into the four answer buttons, keeps track
of which button contains the correct answer, and displays the answers.
@param {object} localq The current question.
*/
function ArrangeAnswers(localq) {
    //array that stores the 3 wrong answers and the correct answer
    var answers = [localq.other1, localq.other2, localq.other3, localq.answer];

    Shuffle(answers);

    //this section makes sure that the 'All are correct' or 'None are correct'
    //answers always appear in the lower right answer box

    //All are correct
    var i = answers.indexOf('All are correct');

    if (i != -1) {
        answers[i] = answers[3];
        answers[3] = 'All are correct';
    }

    //None are correct
    i = answers.indexOf('None are correct');

    if (i != -1) {
        answers[i] = answers[3];
        answers[3] = 'None are correct';
    }

    //All are equally efficient
    i = answers.indexOf('All are equally efficient');

    if (i != -1) {
        answers[i] = answers[3];
        answers[3] = 'All are equally efficient';
    }

    //It depends on the appliance
    i = answers.indexOf('It depends on the appliance');

    if (i != -1) {
        answers[i] = answers[3];
        answers[3] = 'It depends on the appliance';
    }

    //display answers and keeps track of where the correct answer is
    localq.correct = answers.indexOf(localq.answer) + 1;
    $("#DivChoice1").html(answers[0]);
    $("#DivChoice2").html(answers[1]);
    $("#DivChoice3").html(answers[2]);
    $("#DivChoice4").html(answers[3]);
}



/**
Changes the size of question and answer text depending on the length of the string.
@param {object} localq The current question.
*/
function FitText(localq) {
    //changes the size of the question text
    //small question
    if (localq.question.length < 40) {
        $("#questionText").css("font-size", "380%");
    }
        //medium question
    else if (localq.question.length >= 40 && localq.question.length < 80) {
        $("#questionText").css("font-size", "340%");
    }
        //large question
    else {
        $("#questionText").css("font-size", "250%");
    }

    //changes the size of the answer text
    if (localq.other1.length > 25 || localq.other2.length > 25 || localq.other3.length > 25 || localq.answer.length > 25) {
        $(".answer").css("font-size", "200%");
    }
    else {
        $(".answer").css("font-size", "250%");
    }
}



/**
Creates a random permutation of the elements in A using Knuth's shuffle algorithm.  This is used to 
arrange the answers randomly.
@param {Array.<string>} A The four answer choices for the question.
@return {Array.<string>} A randomized array of the four answer choices.
*/
function Shuffle(A) {
    var j, k, temp;
    for (j = A.length - 1 ; j > 0 ; j--) {
        k = Math.floor(Math.random() * (j + 1));
        // swap A[j] and A[k]
        temp = A[j]; A[j] = A[k]; A[k] = temp;
    }
    return A;
}



/**
The timer bar starts each time at a width of 800px and, after a short delay, gets smaller and smaller
until it disappears after 30 seconds.  At this time, the "Timed Out" popup appears and the game screen fades
out.  Clicking Next on this popup will take the user to the Incorrect screen, or they will be sent there
automatically after 15 seconds.
*/
function StartTimer() {
    //ensures that the timer is always reset to 800px with its standard border
    $("#timer").css("width", "800px");
    $("#timer").css("border", "1px #afa496 groove");

    //delays just a little bit so that the timer doesn't start as soon as the user gets to this screen
    $("#timer").delay(300).animate({ width: "0" }, 30000, function () {
        //this is what happens if the timer runs out
        //gets rid of the timer's border so that the timer completely disappears
        $("#timer").css("border", "0 black groove");

        //bringing up the 'Timed Out' popup
        $("#RanOutOfTime").fadeIn(800);

        //fades out the game screen so that the user can focus on the 'Timed Out' popup
        $("#MainGameScreen").animate({ opacity: "0.5" });
        $(".nextButton").prop("disabled", false);

        //makes sure the user is no longer able to click answers
        DisableAnswerButtons();

        //if the user doesn't click 'Next' within 15s, they are automatically moved to 'Incorrect'
        NextScreenCountdown();
    });
}



/**
 * Invoked when the user clicks one of the four possible answers.
 */
$("#DivChoice1").click(function () {
    AnswerClicked(1);
});
$("#DivChoice2").click(function () {
    AnswerClicked(2);
});
$("#DivChoice3").click(function () {
    AnswerClicked(3);
});
$("#DivChoice4").click(function () {
    AnswerClicked(4);
});



/**
When an answer is clicked, the timer is stopped, all answer buttons are disabled so that a user cannot click
multiple answers, the continue button is enabled and appears so that the user can move forward in the game, 
and if the user answers correctly they are taken to the Correct screen, otherwise they are taken to the 
Incorrect screen.  The variable numCorrect is also incremented if the user answers correctly.
@param {number} buttonNumber Number of the answer button that is clicked.
*/
function AnswerClicked(buttonNumber) {
    $("#timer").stop();
    DisableAnswerButtons();

    //enables the continueButton
    $(".continueButton").prop("disabled", false);

    $("#MainGameScreen").fadeOut();

    //determine if the user's answer was correct or incorrect

    //correct screen
    if (q.correct == buttonNumber) {
        AdjustExplanation();
        $("#CorrectScreen").fadeIn();
        $(".continueButton").delay(200).fadeIn();
        categoryTracker = q.category;
        StillPlaying();
        numCorrect++;
    }
        //incorrect screen
    else {
        AdjustExplanation();
        $("#IncorrectScreen").fadeIn();
        $(".continueButton").delay(200).fadeIn();
        StillPlaying();
    }
    //lights up a new piece of NYS if the user answered another question correctly
    LightUpNYS();

    //gives the user a new badge if they got a difficult question correct
    ShowBadges();
}



/**
Invoked when the user clicks next.  Next immediately becomes disabled so that the user cannot click it multiple times,
and the "Timed Out" popup fades out.  Finally, the Incorrect Screen fades in.
*/
$(".nextButton").click(function () {
    $(".nextButton").prop("disabled", true);
    $("#RanOutOfTime").fadeOut();
    $("#MainGameScreen").fadeOut();

    StillPlaying();
    //enables the continueButton
    $(".continueButton").fadeIn();
    $(".continueButton").prop("disabled", false);

    //changes the explanation to be specific to the question that was asked
    AdjustExplanation();

    $("#IncorrectScreen").fadeIn();

    //since the user clicked Next, we don't need to move them to 'Incorrect' automatically
    clearTimeout(timer);
});




/**
Timed function that automatically moves the user on from the "Timed Out" popup to the Incorrect Screen 
after 15 seconds regardless of whether they clicked Next.
*/
function NextScreenCountdown() {
    //gives the user 15 seconds to click next, or the incorrect screen comes up anyway
    timer = setTimeout(function () {
        $(".nextButton").prop("disabled", true);
        $("#RanOutOfTime").fadeOut();
        $("#MainGameScreen").animate({ opacity: "1" });
        $("#MainGameScreen").fadeOut();

        //enables the continueButton
        $(".continueButton").prop("disabled", false);
        $(".continueButton").delay(200).fadeIn();

        //changes the explanation to be specific to the question that was asked
        AdjustExplanation();

        //start the inactivity timer -  the user has 1 min from now to be active or the game quits
        StillPlaying();
        $("#IncorrectScreen").delay(300).fadeIn();
    }, 15000);
}



/**
Invoked when the user clicks continue.  The continue button gets disabled after they click it once to prevent the user
from skipping questions, and it cancels the countdown that makes the "Still Playing?" screen pop up.
The question number is incremented and, depending on what the question number is, either a new question will
appear or the game will take you to the CongratulationsScreen or SorryScreen.  On the Congratulations screen, after
showing a "Congrats, you won" message for 7 seconds, the filled NYS shifts down, this message disappears, and
a "Please show attendant" message appears at the top.  After another 30 seconds,  the resetButton appears.
*/
$(".continueButton").click(function () {
    //disables continueButton after it's clicked once
    $(".continueButton").prop("disabled", true);

    //cancels the inactivity countdown
    clearTimeout(countdown);

    questionNumber++;
    $("#IncorrectScreen").fadeOut();
    $("#CorrectScreen").fadeOut();
    $(".continueButton").fadeOut();

    //checks to see how many questions have been answered
    //on the tenth question the game will check how many correct answers the user has
    //and will send them to the winning or losing screen based on that number
    if (questionNumber > 9) {
        //send the user to the winning screen
        if (numCorrect > 5) {
            //figure out what the user's title is
            var title = GetTitle();

            //this is the message given to the user
            $("#congratsMessage").html("You answered " + numCorrect +
                " questions correctly!  That makes you " + title + "!");

            //shows another badge if the user answered the last difficult question correctly
            ShowBadges();
            $(".continueButton").fadeOut();
            //bring the user to the 'CongratulationsScreen' screen because they won the game
            $("#CongratulationsScreen").fadeIn();

            //Free cheering sound found here: https://www.youtube.com/watch?v=d3Awl_5c8jI
            playSound('sounds/cheering.mp3');

            //after 5 seconds the congrats message goes away, the map shifts down,
            //the blue and gold banner fades out, and the 'show attendant' message comes up
            setTimeout(function () {
                $(".congratstext").fadeOut();
                $(".nyPieces").animate({ top: "160px" }, 600);
                $(".fireworks").animate({ top: "160px" }, 600);
                $(".leftBadges").animate({ top: "160px" }, 600);
                $(".rightBadges").animate({ top: "160px" }, 600);
                $(".pscfooter").fadeOut();
                $(".showAttendant").delay(500).fadeIn();
                $(".resetButton").delay(1000).fadeIn();
            }, 3000);

            //reset button appears after 5s so the user doesn't accidentally click it 
            //before showing an attendant that they won
            //$(".resetButton").delay(3000).fadeIn();
        }

            //send the user to the losing screen
        else {
            //the user only got one question correct
            if (numCorrect == 1) {
                $("#sorryMessage").html("You answered " + numCorrect +
                    " question correctly but you needed 6 to win.");
            }
                //the user got more than one question correct, but still less than 6
            else {
                $("#sorryMessage").html("You answered " + numCorrect +
                    " questions correctly but you needed 6 to win.");
            }
            $("#SorryScreen").fadeIn();
            $(".resetButton").fadeIn();
        }
    }

        //the user has not yet answered 10 questions, so the game continues
    else {
        AskQuestion();
        $("#MainGameScreen").css("opacity", "1");
        $("#MainGameScreen").fadeIn();
    }
});

$('#continueGame').click(function() {
    $.unblockUI();
    $(".resetButton").fadeIn();
});

/**
Invoked when the user clicks reset.  This fades out all possible end screens (Congrats & Sorry) and brings up the Home Screen.
*/
$(".resetButton").click(function () {
    $(".resetButton").fadeOut();
    $(".showAttendant").fadeOut();
    $("#CongratulationsScreen").fadeOut();
    $("#SorryScreen").fadeOut();
    $("#HomeScreen").fadeIn();
    $(".pscfooter").fadeIn();
    $("#playButton").prop("disabled", false);
    //IF THE SOUND IS CHANGED TO SOMETHING LONGER THAN 30S, THIS IS USED TO PAUSE IT AFTER THE USER CLICKS RESET audio.pause();
});



/**
Depending on what the question category is, this function lights up the corresponding icon and displays
the corresponding category label.  If the question category is miscellaneous, then all four icons are lit up
and no labels are displayed.
@param {object} question The current question being asked.
*/
function LightUpCategoryIcon(localq) {
    //light up water icon and show water label for a water question
    if (localq.category == "water") {
        $("#water").css("opacity", "1");
        $("#waterlabel").css("visibility", "visible");
    }

        //light up elec icon and show elec label for an elec question
    else if (localq.category == "elec") {
        $("#electricity").css("opacity", "1");
        $("#electricitylabel").css("visibility", "visible");
    }

        //light up gas icon and show gas label for a gas question
    else if (localq.category == "gas") {
        $("#gas").css("opacity", "1");
        $("#gaslabel").css("visibility", "visible");
    }

        //light up phone icon and show phone label for a phone question
    else if (localq.category == "tele") {
        $("#phone").css("opacity", "1");
        $("#phonelabel").css("visibility", "visible");
    }

        //if the question's category is miscellaneous, light up all 4 icons and display no labels
    else if (localq.category == "misc") {
        $("#water").css("opacity", "1");
        $("#electricity").css("opacity", "1");
        $("#gas").css("opacity", "1");
        $("#phone").css("opacity", "1");
    }
}



/**
Dims the icons and labels on the question screen so that the game does not 'remember' the previous 
question category.  This ensures that LightUpCategoryIcon always lights up only the icon that corresponds to the 
current question.
*/
function DimAllCategoryIcons() {
    //dims all of the icons
    $("#water").css("opacity", "0.05");
    $("#electricity").css("opacity", "0.05");
    $("#gas").css("opacity", "0.05");
    $("#phone").css("opacity", "0.05");

    //hides all labels
    $(".label").css("visibility", "hidden");
}



/**
Lights up the pieces of NYS shown on Correct, Incorrect, CongratulationsScreen, and SorryScreen
according to how many questions the user has correctly answered.  Once a piece of NYS has been lit up 
it won't return to its dimmed appearance until the Play button is clicked again (a new game is started).
This means that each successive condition does not need to light up all badges up to that point,
i.e. 3 questions correct doesn't need to light up NYS 1, 2, and 3.  It just needs to light up the 
new badge.
*/
function LightUpNYS() {
    if (numCorrect == 1) {
        $(".nys1").css("opacity", "1");
    }
    else if (numCorrect == 2) {
        $(".nys2").css("opacity", "1");
    }
    else if (numCorrect == 3) {
        $(".nys3").css("opacity", "1");
    }
    else if (numCorrect == 4) {
        $(".nys4").css("opacity", "1");
    }
    else if (numCorrect == 5) {
        $(".nys5").css("opacity", "1");
    }
    else if (numCorrect >= 6) {
        $(".nys6").css("opacity", "1");
    }
}



/**
 * When hard questions are correctly answered, this function lights up the badge corresponding to the category
 * of the question that was answered correctly.
 */
function ShowBadges() {
    if (numCorrect > 6) {
        if (categoryTracker == "water") {
            $(".waterbadge").show();
        }
        if (categoryTracker == "elec") {
            $(".electricitybadge").show();
        }
        if (categoryTracker == "gas") {
            $(".gasbadge").show();
        }
        if (categoryTracker == "tele") {
            $(".phonebadge").show();
        }
    }
}



/**
Adjusts the explanation that appears on the Correct or Incorrect screens so that it explains why 
the correct answer is correct.  Also changes font size of the explanation based on the length of the
explanation.
*/
function AdjustExplanation() {
    //this is  the question-specific explanation
    var explanation = q.explanation;

    //displaying the explanation
    $(".explanation").html(explanation);

    //changes size of the text on the correct/wrong screen
    //a medium sized explanation
    if ($(".explanation").html().length > 125 && $(".explanation").html().length < 200) {
        $(".explanation").css("font-size", "150%");
    }
        //a long explanation
    else if ($(".explanation").html().length >= 200) {
        $(".explanation").css("font-size", "130%");
    }
        //a small explanation
    else {
        $(".explanation").css("font-size", "170%");
    }
}



/**
If the user is inactive for 30 seconds on either the Correct or Incorrect screen, they are given
a message that asks them if they are still playing.  They can click Continue to keep playing, or if they 
remain inactive for 30 more seconds the game aborts and takes them back to the Home Screen.
*/
function StillPlaying() {
    countdown = setTimeout(function () {
        //fading out all possible screens that the user could be on when they became inactive
        $(".continueButton").prop("disabled", true);
        $("#InactiveUser").fadeIn();
        $("#MainGameScreen").animate({ opacity: "0.5" });
        $("#CorrectScreen").animate({ opacity: "0.3" });
        $("#IncorrectScreen").animate({ opacity: "0.3" });
        $(".continueButton").animate({ opacity: "0.3" });
        $("#CongratulationsScreen").animate({ opacity: "0.3" });
        $("#SorryScreen").animate({ opacity: "0.3" });

        finalTimer = setTimeout(function () {
            //the user has been inactive for 1 min, and they are being sent back to the home screen
            $("#InactiveUser").fadeOut();
            $("#MainGameScreen").animate({ opacity: "1" });
            $("#IncorrectScreen").fadeOut();
            $("#CorrectScreen").fadeOut();
            $(".continueButton").fadeOut();
            $("#CongratulationsScreen").fadeOut();
            $("#SorryScreen").fadeOut();
            $("#HomeScreen").fadeIn();
            $("#playButton").prop("disabled", false);
        }, 30000);
    }, 30000);


}



/**
Invoked when the user receives the "Still Playing?" alert and they click Continue, the game takes them either to the next 
question or to the CongratulationsScreen or SorryScreen.
*/
$(".keepPlayingButton").click(function () {
    //makes sure that, regardless of what screen the user was on when they became inactive,
    //that screen will light back up if they click Continue
    $("#InactiveUser").fadeOut();
    $("#MainGameScreen").css("opacity", "1");
    $("#CorrectScreen").css("opacity", "1");
    $("#IncorrectScreen").css("opacity", "1");
    $(".continueButton").css("opacity", "1");
    $(".continueButton").fadeOut();
    $("#CongratulationsScreen").css("opacity", "1");
    $("#SorryScreen").css("opacity", "1");

    //cancels the inactive countdown
    clearTimeout(countdown);
    clearTimeout(finalTimer);

    questionNumber++;
    $("#IncorrectScreen").fadeOut();
    $("#CorrectScreen").fadeOut();

    //checks to see how many questions have been answered
    //on the tenth question the game will check how many correct answers the user has
    //and will send them to the winning or losing screen based on that number
    if (questionNumber > 9) {
        if (numCorrect > 5) {
            //send the user to the winning screen
            $("#CongratulationsScreen").fadeIn();
        }
        else {
            //send the user to the losing screen
            $("#SorryScreen").fadeIn();
        }
    }
    else {
        AskQuestion();
        $("#MainGameScreen").fadeIn();
    }

});



/**
Depending on how many questions have been answered correctly, changes the user's title.
@return {string} Returns the user's title.
*/
function GetTitle() {
    if (numCorrect == 6) {
        return "a well-informed consumer";
    }
    else if (numCorrect == 7) {
        return "a knowledgeable consumer";
    }
    else if (numCorrect == 8) {
        return "a great consumer";
    }
    else if (numCorrect == 9) {
        return "a utility expert";
    }
    else {
        return "a utility superstar";
    }
}



/**
Disables all answer buttons so that the user cannot answer multiple times per question.
*/
function DisableAnswerButtons() {
    $("#DivChoice1").prop("disabled", true);
    $("#DivChoice2").prop("disabled", true);
    $("#DivChoice3").prop("disabled", true);
    $("#DivChoice4").prop("disabled", true);
}



/**
Re-enables all answer buttons so that they can be used in the next question.
*/
function EnableAnswerButtons() {
    $("#DivChoice1").prop("disabled", false);
    $("#DivChoice2").prop("disabled", false);
    $("#DivChoice3").prop("disabled", false);
    $("#DivChoice4").prop("disabled", false);
}



/**
 * Plays a sound file.
 * @param {string} file Name of the sound file.
 */
function playSound(file) {
    var audio = document.createElement('audio');
    audio.src = file;
    audio.load();
    audio.play();
}
