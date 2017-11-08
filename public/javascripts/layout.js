//Socket Connection.//Socket Connection.
var socket = io.connect('http://10.54.60.116:81');

var en = {
  title : "Search Collective Agreements",
  helpBtn : "Help",
  tutorialBtn : "Tutorial",
  feedbackBtn : "Feedback",
  downloadBtn : "Download",
  resultsTxt : " Results Found"
};
var fr = {
  title : "Search Collective Agreements FR",
  helpBtn : "Aider",
  tutorialBtn : "Tutorial FR",
  feedbackBtn : "Feedback FR",
  downloadBtn : "Download FR",
  resultsTxt : " Results Found FR"
}
var tutMode = false;

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

$(document).ready(function (){

  function loadingAnimation(){
    $("#search-results").html('<div id="loading-container"><div class="lds-css"><div style="width:200px;height:200px;" class="lds-ripple"><div></div><div></div></div></div></div>');
  }

  //search event listener
  $("#search-bar").keyup(debounce(function(event){
    //When enter is pressed on search bar
    if(event.which == 13){
      if($("#auto-complete .auto-comp-active").length){
        $('#search-bar').val($("#auto-complete .auto-comp-active").text());
        socket.emit('autoCompleteSelected', {selectedId: $("#auto-complete .auto-comp-active").attr("data-uid")});
      }

      $("#auto-complete").html("").css("border-top", "none");
      //If there are search results currently...
      if($("#search-results").html() != ''){
        $("#search-results").fadeOut(function (){
          //Loading Gif
          $(this).fadeIn();
          loadingAnimation();
          //Search for something
          socket.emit('searchAttempt', {searchInput:$('#search-bar').val()});
        });
      }else{
        //Loading Gif
        loadingAnimation();
        //Search for something
        socket.emit('searchAttempt', {searchInput:$('#search-bar').val()});
      }
    }else if(event.which == 40){
      //Down
      if($("#auto-complete .auto-comp-active").length != 0){
        //if list is not empty
        if($("#auto-complete .auto-comp-active").next().length){
          $("#auto-complete .auto-comp-active").removeClass('auto-comp-active').next().addClass('auto-comp-active');
        }
      }else{
        $("#auto-complete p").eq(0).addClass("auto-comp-active");
      }
    }else if(event.which == 38){
      //Up
      if($("#auto-complete .auto-comp-active").length != 0){
        //if list is not empty
        if($("#auto-complete .auto-comp-active").prev().length){
          $("#auto-complete .auto-comp-active").removeClass('auto-comp-active').prev().addClass('auto-comp-active');
        }else{
          $("#auto-complete .auto-comp-active").removeClass('auto-comp-active');
        }
        var tempInput = $("#search-bar").val();
        $("#search-bar").val("");
        $("#search-bar").val(tempInput);
      }
    }else if(event.which == 37 || event.which == 39 || event.which == 16 || event.which == 17 || event.which == 18 || event.which == 9){

    }else{
      //When search bar has text greater than 3 characters
      if($(this).val().length > 3){
        socket.emit('autoCompleteAttempt', {searchInput:$('#search-bar').val()});
      }else{
        $("#auto-complete").html("").css("border-top", "none");
      }
    }
  },50));

  //French Translations
  $('#french-btn').click(function (){
    if($(this).attr("data-current") == 'en'){
      $(this).attr("data-current","fr");
      $(this).attr("data-tooltip","English");
      $(this).tooltip({delay: 50});
      $(this).transition({
        perspective: '100px',
        rotateX: '180deg',
        complete: function (){
          $('#french-btn').removeClass('teal').addClass('indigo').text("En");
        }
      }).transition({
        perspective: '100px',
        rotateX: '0deg'
      });
      $("#search-title").text(fr.title);
      //$("#help-btn").attr("data-tooltip",fr.helpBtn);
      $("#tutorial-btn").attr("data-tooltip",fr.tutorialBtn);
      //$("#feedback-btn").attr("data-tooltip",fr.feedbackBtn);
      $(".download-btns").each(function (){
        $(this).attr("data-tooltip",fr.downloadBtn);
      });
    }else{
      $(this).attr("data-current","en");
      $(this).attr("data-tooltip","Français");
      $(this).tooltip({delay: 50});
      $(this).transition({
        perspective: '100px',
        rotateY: '180deg',
        complete: function (){
          $('#french-btn').removeClass('indigo').addClass('teal').text("Fr");
        }
      }).transition({
        perspective: '100px',
        rotateY: '0deg'
      });

      $("#search-title").text(en.title);
      //$("#help-btn").attr("data-tooltip",en.helpBtn);
      $("#tutorial-btn").attr("data-tooltip",en.tutorialBtn);
      //$("#feedback-btn").attr("data-tooltip",en.feedbackBtn);
      $(".download-btns").each(function (){
        $(this).attr("data-tooltip",en.downloadBtn);
      });
    }

    //$("#help-btn-div a").tooltip({delay: 50});
    $(".download-btns").tooltip({delay: 0}).each(function (){
      $("#"+$(this).attr('data-tooltip-id')).css("margin-top", "16px").css("margin-left", "-8px");
    });
  });

  /*
  $("#help-btn").click(function (){
    $("#help-btn-div a").tooltip({delay: 50});
  });
  */
  //Tutorial
  $("#tutorial-btn").click(function (){
    tutMode = true;
    $(".tut1explain").css("display","block");
    $("#tutorial-div").show().transition({opacity:1});
    $("#tut1container").css("background-color","white").css('position', 'relative').css("z-index","101");
    $("#tut1explain1").transition({opacity:1, y:10, delay:1000});
    $("#tut1explain2").transition({opacity:1, y:10, delay:1500});
    $("#tut1explain3").transition({opacity:1, y:10, delay:2000});
    $("#tut1explain4").transition({opacity:1, y:10, delay:2500});
    $("#tut1explain5").transition({opacity:1, y:10, delay:3000});
    $("#tut1title").show();
    $("#tutorial-btn").hide();
    $("#close-btn-div").show();
  });

  $("#close-btn-div").click(function (){
    closeTutorial();
  });
  //Begining Init
  $("#search-bar").focus().val("");
  $("#search-results").css("top", ($(".container").height()+180) + "px");
});

function closeTutorial(){
  tutMode = false;
  $(".tut1explain").css("display","none");
  $("#tutorial-div").hide().transition({opacity:0, duration:0});
  $("#tut1explain1").transition({opacity:0, y:0, duration:0});
  $("#tut1explain2").transition({opacity:0, y:0, duration:0});
  $("#tut1explain3").transition({opacity:0, y:0, duration:0});
  $("#tut1explain4").transition({opacity:0, y:0, duration:0});
  $("#tut1explain5").transition({opacity:0, y:0, duration:0});

  $("#tutorial-btn").show();
  $("#close-btn-div").hide();
}
//Socket Io
socket.on('searchResults', function (data) {
  //hide loading gif
  $("#loading-container").fadeOut(function(){
    $(this).remove();
  });
  //Search Result Count
  /*
  if($('#french-btn').data("current") == 'en'){
    $("#search-results").append("<h4 id='search-results-count' style='opacity:0;'><b>"+data.data.length+"</b>"+en.resultsTxt+"</h4>");
  }else{
    $("#search-results").append("<h4 id='search-results-count' style='opacity:0;'><b>"+data.data.length+"</b>"+fr.resultsTxt+"</h4>");
  }
  $("#search-results-count").transition({opacity:1,delay:300});
  */

  //Results
  for (var i = 0; i < data.data.length; i++) {

    if($('#french-btn').data("current") == 'en'){
      var downloadText = en.downloadBtn;
      var thumbUpText = "This is the correct result";
      var thumbDownText = "This is the wrong result";
    }else{
      var downloadText = fr.downloadBtn;
      var thumbUpText = "This is the correct result";
      var thumbDownText = "This is the wrong result";
    }
    //Todo, set ID. return ID.
    $("#search-results").append("<div class='row search-result' id='search-"+i+"' style='opacity:0; transform: translate(0px, 10px);'><div class='col s12'><div class='result-container'>"+
      "<div class='thumb-div'>"+
        "<a class='thumb-buttons thumb-up' data-position='top' data-delay='50' data-tooltip='"+thumbUpText+"' ><i class='material-icons light-green-text'>thumb_up</i></a></br>"+
        "<a class='thumb-buttons thumb-down' data-position='bottom' data-delay='50' data-tooltip='"+thumbDownText+"' ><i class='material-icons red-text text-lighten-2'>thumb_down</i></a>"+
      "</div>"+
      "<div class='result-title'>"+"temp title"+ //data.data[i][1]+
        "<a class='btn-flat waves-effect waves-grey lighten-2 download-btns' data-position='top' data-delay='50' data-tooltip='"+downloadText+"' id='download-"+i+"'><i class='material-icons'>file_download</i></a>"+
      "</div>"+
      "<div class='result-pdf'>"+
        "<div class='result-pdf-page z-depth-4'>"+
          "<p class='blurry-text1'> Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Nulla Lacinia, Urna Quis Pharetra Facilisis, Arcu Augue Pharetra Ligula Ac Laoreet Mauris.</p>"+
          "<p class='result-text'>"+data.data[i][0]+"</p>"+
          "<p class='blurry-text2'> Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Nulla Lacinia, Urna Quis Pharetra Facilisis, Arcu Augue Pharetra Ligula, Ac Laoreet Mauris.</p>"+
          "</div>"+
        "</div>"+
      "</div></div></div>");
    $("#search-"+i).transition({opacity:1, y:0, delay: 100 + i*250});
  }
  //click result to open up pdf.
  $(".result-pdf").click(function (){
    $.fileDownload('/pdf/GraphBasics.pdf');
  });

  //download button event
  $(".download-btns").click(function (){
    //Find & download link
    $.fileDownload('/pdf/GraphBasics.pdf');
  });
  $(".download-btns").tooltip({delay: 50}).each(function (){
    $("#"+$(this).data('tooltip-id')).css("margin-top", "16px").css("margin-left", "-8px");
  });

  //Thumb up or down
  $(".thumb-up").click(function (){
    $(this).parent().find('.thumb-down').removeClass('thumb-active');
    $(this).addClass('thumb-active');
  });
  $(".thumb-up").tooltip({delay: 50}).each(function (i, obj){
    $(obj).css("margin-top", "16px");
  });

  $(".thumb-down").click(function (){
    $(this).parent().find('.thumb-up').removeClass('thumb-active');
    $(this).addClass('thumb-active');
  });
  $(".thumb-down").tooltip({delay: 50}).each(function (i, obj){
    $(obj).css("margin-top", "0px");
  });

  //If still tutorial mode, show the next steps & change the buttons back.
  if(tutMode){
    closeTutorial();
    //first returned search.
    var fSearch = $("#search-results").find(".search-result")[0];
    if(fSearch){
      //title
      var tutTitle = $("<div>");
      tutTitle.addClass("floatingtext");
      tutTitle.html("The PDF title is shown here");
      tutTitle.css("margin-top","-33px");
      tutTitle.css("margin-left","30px");
      $(fSearch).append(tutTitle);

      //content
      var tutContent = $("<div>");
      tutContent.addClass("floatingtext");
      tutContent.html("The relevent PDF content is displayed here");
      tutContent.css("margin-top","60px");
      tutContent.css("margin-left","500px");
      $(fSearch).append(tutContent);

      //download
      var tutdown = $("<div>");
      tutdown.addClass("floatingtext");
      tutdown.html("Download the PDF here");
      tutdown.css("right","0");
      tutdown.css("margin-right","80px");
      $(fSearch).append(tutdown);

      //Thumbs
      var tutthumb = $("<div>");
      tutthumb.addClass("floatingtext");
      tutthumb.html("Use the thumbs up or down </br>to improve our search results");
      tutthumb.css("right","0");
      tutthumb.css("margin-right","-140px");
      tutthumb.css("margin-top","60px");
      $(fSearch).append(tutthumb);

      $(".floatingtext").click(function (){
        $(this).transition({
          opacity:0,
          y: -5,
          complete: function (){
            $(this).remove();
          }
        });
      });
    }
  }
});

socket.on('autoComplete', function (data){
  $("#auto-complete").html("");
  if(data.length){
    $("#auto-complete").css("border-top", "1px solid #ddd");
  }else{
    $("#auto-complete").css("border-top", "none");
  }
  for (var i = 0; i < data.length; i++) {
    var addedP = $("<p>").attr("style","opacity:0; transform: translate(0px, 5px);").attr("data-uid",data[i]._id).text(data[i].searchStr);
    $("#auto-complete").append(addedP);
    addedP.transition({opacity:1,y:0});
  };

  //If one of the auto complete is clicked on.
  $("#auto-complete p").click(function (){
    $("#search-bar").val($(this).text());
    var e = jQuery.Event("keyup");
    e.which = 13;
    $("#search-bar").trigger(e);
    socket.emit('autoCompleteSelected', {selectedId: $(this).attr("data-uid")});
  });
});
