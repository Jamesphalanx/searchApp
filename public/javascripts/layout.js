//Socket Connection.
var socket = io.connect('http://localhost');

var en = {
  title : "Search Collective Agreements",
  helpBtn : "Help",
  tutorialBtn : "Tutorial",
  feedbackBtn : "Feedback"
};
var fr = {
  title : "Search Collective Agreements FR",
  helpBtn : "Aider",
  tutorialBtn : "Tutorial FR",
  feedbackBtn : "Feedback FR"
}
var tutMode = false;

$(document).ready(function (){
  //Begining Init
  $("#search-bar").focus();

  function loadingAnimation(){
    $("#search-results").html('<div id="loading-container"><div class="lds-css"><div style="width:200px;height:200px;" class="lds-ripple"><div></div><div></div></div></div></div>');
  }

  //When enter is pressed
  $("#search-bar").keyup(function(event){
    if(event.keyCode == 13){
      if(tutMode){
        $("#tut1container").transition();
      }
      //Loading Gif
      loadingAnimation();
      //Search for something
      socket.emit('searchAttempt', {searchInput:$('#search-bar').val()});
    }
  });

  $('#french-btn').click(function (){
    if($(this).attr("data-current") == 'en'){
      $(this).attr("data-current","fr");
      $(this).attr("data-tooltip","English");
      $(this).text("En");
      $(this).tooltip({delay: 50});
      $(this).transition({
        perspective: '100px',
        rotate3d: '1,1,0,360deg'
      }).removeClass('teal').addClass('indigo');

      $("#search-title").text(fr.title);
      $("#help-btn").attr("data-tooltip",fr.helpBtn);
      $("#tutorial-btn").attr("data-tooltip",fr.tutorialBtn);
      $("#feedback-btn").attr("data-tooltip",fr.feedbackBtn);
      $("#help-btn-div a").tooltip({delay: 50});
    }else{
      $(this).attr("data-current","en");
      $(this).attr("data-tooltip","Français");
      $(this).text("Fr");
      $(this).tooltip({delay: 50});
      $(this).transition({
        perspective: '100px',
        rotate3d: '1,1,0,0deg'
      }).removeClass('indigo').addClass('teal');

      $("#search-title").text(en.title);
      $("#help-btn").attr("data-tooltip",en.helpBtn);
      $("#tutorial-btn").attr("data-tooltip",en.tutorialBtn);
      $("#feedback-btn").attr("data-tooltip",en.feedbackBtn);
      $("#help-btn-div a").tooltip({delay: 50});
    }
  });
  $("#help-btn").click(function (){
      $("#help-btn-div a").tooltip({delay: 50});
  });

  //Tutorial
  $("#tutorial-btn").click(function (){
    tutMode = true;
    $("#tutorial-div").show().transition({opacity:1});
    $("#tut1container").css('position', 'relative').css("z-index","101");
      $("#tut1explain1").transition({opacity:1, y:10, delay:1000});
      $("#tut1explain2").transition({opacity:1, y:10, delay:1500});
      $("#tut1explain3").transition({opacity:1, y:10, delay:2000});
      $("#tut1explain4").transition({opacity:1, y:10, delay:2500});
      $("#tut1explain5").transition({opacity:1, y:10, delay:3000});
  });
});

//Socket Io
socket.on('searchResults', function (data) {

  //hide loading gif
  $("#loading-container").fadeOut(function(){
    $(this).remove();
  });
  console.log(data);
  //Search Result Count
  $("#search-results").append("<h4 id='search-results-count' style='opacity:0;'>"+data.answers.length+" results found</h4>");
  $("#search-results-count").transition({opacity:1,delay:300});
  //Results
  for (var i = 0; i < data.answers.length; i++) {
    $("#search-results").append("<div class='row' id='search-"+i+"' style='opacity:0; transform: translate(0px, 10px);'><div class='col s12'><div class='result-container'>"+
      "<div class='result-title'>"+data.answers[i].pdf_link+
        "<a class='btn-flat waves-effect waves-grey lighten-2 download-btns' id='download-"+i+"'><i class='material-icons'>file_download</i></a>"+
      "</div>"+
      "<div class='result-pdf'>"+
        "<div class='result-pdf-page z-depth-4'>"+
          "<p class='blurry-text1'>Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Nulla Lacinia, Urna Quis Pharetra Facilisis, Arcu Augue</p>"+
          "<p>"+data.answers[i].passage+"</p>"+
          "<p class='blurry-text2'>Morbi Luctus Ex Eget Pellentesque Pretium. Fusce At Quam Orci. Etiam Sapien Purus, Cursus Ut Elit Sed, Faucibus</p>"+
          "</div>"+
        "</div>"+
      "</div></div></div>");
    $("#search-"+i).transition({opacity:1, y:0, delay: 100 + i*250});
  }
});


