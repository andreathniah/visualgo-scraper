$(function() {
  var ddlArray = []; // 2D array to store slides' value [0] and text [1]
  var requestedURL = localStorage.getItem("urlInput");
  var lectureTitle = getTopic(requestedURL);

  var progressMsg = "Fetching <strong>" + lectureTitle + "</strong>...";
  document.getElementById("progress").innerHTML = progressMsg;
  console.log(requestedURL);

  getHTML(requestedURL, function(httpDoc) {
    var chapterNo = getChapterNo(httpDoc, ddlArray);
    console.log("Total number of chapters: " + ddlArray.length);

    for (i=0; i<ddlArray.length; i++) {
      loadLectureContent(httpDoc, ddlArray[i]);
    }

    document.getElementById("loading").outerHTML = "";
    document.getElementById("electure-dropdown").outerHTML = "";
    document.getElementById("lectureContent").style.visibility = "visible";
  });

  // direct relative paths to visualgo.net
  $(document).on("click","a:not([href^=http])",function(){
    this.href = "https://visualgo.net/en/" + this.getAttribute("href");
  })
});

// append visualgo slides' content into document
function loadLectureContent(httpDoc, index) {
  var divName = "electure-" + index[0]; // get the 1st part of the 2d array - value of the ddlArray
  var slideDiv = httpDoc.getElementById(divName);

  var containerDiv = document.getElementById("lecture-container");
  var titleNode = document.createElement("p");
  var lectureNode = document.createElement("div");

  titleNode.style.cssText = "font-weight: bold";
  titleNode.append(index[1]); // append because its not a node, but a normal string (text of ddlArray)
  lectureNode.appendChild(titleNode);
  lectureNode.appendChild(slideDiv);
  containerDiv.appendChild(lectureNode);

  validation(slideDiv); // validation to remove uneccessary styles
}

function validation(slideDiv) {
  slideDiv.removeAttribute("style"); // remove hardcoded styles
  $(slideDiv).find("br:not(pre>br)").remove(); // remove any <br> that are not in <pre>

  // remove next, prev and esc arrows
  if ($(slideDiv).find(".electure-next").length) slideDiv.getElementsByClassName("electure-next")[0].outerHTML = "";
  if ($(slideDiv).find(".electure-prev").length) slideDiv.getElementsByClassName("electure-prev")[0].outerHTML = "";
  if ($(slideDiv).find(".electure-end").length) slideDiv.getElementsByClassName("electure-end")[0].outerHTML = "";
}

// XMLHttpRequest to grab URL's HTML information
function getHTML(requestedURL, callback) {
  var xhttp = new XMLHttpRequest();
  var proxyURL = getProxyURL(requestedURL);

  xhttp.open("GET", proxyURL, true);
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200 && callback) {
      var httpDoc = domParse(xhttp.responseText);
      callback(httpDoc);
    }
  }
  xhttp.send();
}

// isolate nav-bar to get the slide's text and values
function getChapterNo(httpDoc, ddlArray) {
  var chapterNo, chapterValue, chapterText;

  chapterNo = httpDoc.getElementById("electure-dropdown").childNodes[1];
  for (i=0; i<chapterNo.options.length; i++) {
    chapterValue = chapterNo.options[i].value;
    chapterText = chapterNo.options[i].text;
    ddlArray.push([chapterValue, chapterText]);
  }
  return ddlArray;
}

// enable cross-origin resource sharing
function getProxyURL(requestedURL) {
  var proxyURL, urlArray, totalLength, part1, part2;

  urlArray = requestedURL.split("/");
  totalLength = (urlArray[0] + urlArray[1]).length+2;
  part1 = "https://cors-anywhere.herokuapp.com/";
  part2 = requestedURL.substr(totalLength, requestedURL.length);
  proxyURL = part1 + part2;

  return proxyURL;
}

// get redirection link the for progress bar
function getTopic(requestedURL) {
  var urlArray = requestedURL.split("?");
  var updatedURL = urlArray[0];
  return updatedURL;
}

// parse from XML to HTML text
function domParse(data) {
  var parser = new DOMParser();
  var httpDoc = parser.parseFromString(data, "text/html");
  return httpDoc;
}
