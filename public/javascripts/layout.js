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


  $('#french-btn').click(function (){
    if($(this).attr("data-current") == 'en'){
      $(this).attr("data-current","fr");
      $(this).attr("data-tooltip","English");
      $(this).text("En");
      $(this).tooltip({delay: 50});

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
socket.on('serachResults', function (data) {

});