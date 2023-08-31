// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const jeopardyAPI_URL = "https://jservice.io/api/";
let categories = [];
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  let res = await axios.get(`${jeopardyAPI_URL}categories?count=6`);
  let categoryIDs = res.data.map((data) => data.id);
  return _.sampleSize(categoryIDs, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(categoryId) {
  let response = "";
  await axios
    .get(`${jeopardyAPI_URL}category?id=${categoryId}`)
    .then((resp) => {
      response = resp;
    })
    .catch((err) => {
      console.log(err);
      alert(
        err.message + ": Too many requests. Please wait a minute and try again"
      );
    });
  let category = response.data;
  let allClues = category.clues;
  console.log(allClues);
  let randomClues = _.sampleSize(allClues, NUM_CLUES);
  let clues = randomClues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title: category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $("#board-table thead").empty();
  let $tr = $("<tr>");
  for (let x = 0; x < NUM_CATEGORIES; x++) {
    $tr.append($("<th>").text(categories[x].title));
  }
  $("#board-table thead").append($tr);
  $("#board-table tbody").empty();
  for (let y = 0; y < NUM_CLUES; y++) {
    let $tr = $("<tr>");
    for (let x = 0; x < NUM_CATEGORIES; x++) {
      $tr.append($("<td>").attr("id", `${x}-${y}`).text("?"));
    }
    $("#board-table tbody").append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  let id = evt.target.id;
  let [x, y] = id.split("-");
  let clue = categories[x].clues[y];
  let cellData;

  if (!clue.showing) {
    cellData = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    cellData = clue.answer;
    clue.showing = "answer";
    $(`#${x}-${y}`).css("background-color", "green");
  } else {
    return;
  }
  $(`#${x}-${y}`).html(cellData);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

async function showLoadingView() {
  $("#loading-container").removeClass("complete");
  $("#loading-container").show();
  $("#board-table").hide();
  $("#start").html("Loading, please wait.").css("font-size", "10px");
  let ready = await setupAndStart();
  let status = "complete";
  hideLoadingView(status);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView(status) {
  $("#loading-container").addClass(status);
  $("#board-table").show();
  $("#start").html("Re-Start").css("font-size", "20px").removeAttr("disabled");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let categoryIds = await getCategoryIds();
  categories = [];
  loadedCategories = 0;
  for (let categoryId of categoryIds) {
    categories.push(await getCategory(categoryId));
    loadedCategories++;
    console.log(loadedCategories);
    await sleep(1000);
  }
  let table = $("#board-table").children();
  if (table.length === 0) {
    let $thead = $("<thead>");
    $("#board-table").append($thead);
    let $tbody = $("<tbody>");
    $("#board-table").append($tbody);
  }
  fillTable();
}

// Used to stop getting the ERR_FAILED 429 (Too Many Requests)
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
/** On click of start / restart button, set up game. */

// TODO

function htmlSetup() {
  $("body").prepend("<div id='loading-container'></>");
  $("body").prepend("<button id='start'>Start</button>");
  $("body").prepend("<table id='board-table'></table>");
  $("#loading-container").append(
    "<IMG src='loading.gif'height=700px border=solid/>"
  );
  $("#loading-container").hide();
  $("#start").on("click", function () {
    $(this).attr("disabled", "disabled");
    showLoadingView(); //this method contains your logic
  });
}
htmlSetup();

/** On page load, add event handler for clicking clues */

// TODO

$(async function () {
  $("#board-table").on("click", "td", handleClick);
});
