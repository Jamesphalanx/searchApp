//Socket Connection.//Socket Connection.
var socket = io.connect('http://10.54.60.116:81');
/*
Created By: James Shin
Date: 2017-11-15
*/
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

  //Init
  $('#filter-div input').val('');

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

      //Hide filter
      $('#filter-div').transition({opacity:0});
      $('#filter-btn').removeClass('active');


      $("#auto-complete").html("").css("border-top", "none");
      //If there are search results currently...
      if($("#search-results").html() != ''){
        $("#search-results").fadeOut(function (){
          //Loading Gif
          $(this).fadeIn();
          loadingAnimation();
          //Search for something
          socket.emit('searchAttempt', {searchInput:$('#search-bar').val(), searchFilter:{pdfName:$("#filter-pdfname-input").val()}});
        });
      }else{
        //Loading Gif
        loadingAnimation();
        //Search for something
        socket.emit('searchAttempt', {searchInput:$('#search-bar').val(), searchFilter:{pdfName:$("#filter-pdfname-input").val()}});
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

  //Filter button
  $('#filter-btn').click(function (){
    var currentState = false;
    if($(this).hasClass('active')){
      $(this).removeClass('active');
      currentState = false;
    }else{
      $(this).addClass('active');
      currentState = true;
    }
    //move svg.
    $.each($('#filter-btn svg').find('rect'), function (i, sel){
      if(currentState){
        $(sel).attr('x',0);
      }else{
        $(sel).attr('x',$(sel).data('x'));
      }
    });

    if(currentState){
      //show filter table
      $('#filter-div').width($('#search-bar-div').width());
      $('#filter-div').transition({opacity:1});
    }else{
      //hide filter
      $('#filter-div').transition({opacity:0});
      $('#filter-div input').val('');
      $("#search-filters").transition({opacity:0});
    }
  });

  //Search Filter Icon
  $('#filter-pdfname-input').keyup(function (event){
    if($(this).val() == ''){
      $("#search-filters").transition({opacity:0});
    }
    if($("#search-filters").css('opacity') == 0){
      $("#search-filters").transition({opacity:1});
    }
    if(event.which == 13){
      var e = $.Event( "keyup", { which: 13 } );
      $("#search-bar").trigger(e);
    }else{
      $("#search-filters").text("Within "+$(this).val()+".pdf");
    }
  });

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
    var tempPDFName = data.data[i].pdf_url.split('/');
    //Todo, set ID. return ID.
    $("#search-results").append("<div class='row search-result' id='search-"+i+"' style='opacity:0; transform: translate(0px, 10px);'><div class='col s12'><div class='result-container'>"+
      "<div class='thumb-div' data-id='"+i+"'>"+
        "<a class='thumb-buttons thumb-up' data-position='top' data-delay='50' data-tooltip='"+thumbUpText+"' >"+
          //"<i class='material-icons light-green-text'>thumb_up</i>"+
          "<svg width='24' height='24' viewBox='0 0 24 24'><path fill='#aed581' d='M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z'/></svg>"+
        "</a></br>"+
        "<a class='thumb-buttons thumb-down' data-position='bottom' data-delay='50' data-tooltip='"+thumbDownText+"' >"+
          "<svg width='24' height='24' viewBox='0 0 24 24'><path fill='#ef9a9a' d='M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z'/></svg>"+
          //"<i class='material-icons red-text text-lighten-2'>thumb_down</i>"+
        "</a>"+
      "</div>"+
      "<div class='result-title'>"+tempPDFName[tempPDFName.length - 1]+
        //"<a class='btn-flat waves-effect waves-grey lighten-2 download-btns' data-pdflink='"+data.data[i].pdf_url+"' data-position='top' data-delay='50' data-tooltip='"+downloadText+"' id='download-"+i+"'><i class='material-icons'>file_download</i></a>"+
      "</div>"+
      "<div class='result-pdf' data-pdflink='"+data.data[i].pdf_url+"' data-pdfmeta='"+data.data[i].metadata+"'>"+
        "<div class='result-pdf-page z-depth-4'>"+
          "<p class='blurry-text1'> Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Nulla Lacinia, Urna Quis Pharetra Facilisis, Arcu Augue Pharetra Ligula Ac Laoreet Mauris.</p>"+
          "<div class='metadatalink'>"+data.data[i].metadata+"</div><p class='result-text'>"+data.data[i].raw_passage+"</p>"+
          "<p class='blurry-text2'> Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Nulla Lacinia, Urna Quis Pharetra Facilisis, Arcu Augue Pharetra Ligula, Ac Laoreet Mauris.</p>"+
        "</div>"+
        "<div class='inlinepdf'></div>"+
      "</div>"+
      "</div></div></div>");
    $("#search-"+i).transition({opacity:1, y:0, delay: 100 + i*250});
  }
  //click result to open up pdf.
  $(".result-pdf").click(function (){
    //remove current pointer event.
    $(this).css('pointer-events','none');

    //window.open('/pdf/GraphBasics.pdf', '_blank');
    var $pdfdiv = $(this).find('.result-pdf-page');
    var $inlinepdf = $(this).find('.inlinepdf');
    $(this).attr('data-prevh',$(this).height());
    $(this).height($pdfdiv.outerHeight());

    $pdfdiv.fadeOut();
    $(this).transition({height:($(window).height()-100)+'px', complete:function (){
      //set inlinepdf size;
      $inlinepdf.css('height', $(this).height()-40);
      $inlinepdf.css('width', $(this).width()-40);
      //current PDF;
      var pdflink = $(this).data('pdflink');
      var pdfmeta = $(this).data('pdfmeta').split('-');
      var $currentIframe = $("<embed>");

      var pdfoptions = "#pagemode=none&navpanes=0&toolbar=0&statusbar=0&zoom=80&page="+pdfmeta[1];
      $currentIframe.css('height', $(this).height()-40);
      $currentIframe.css('width', $(this).width()-40);
      $currentIframe.attr('src',pdflink+pdfoptions);
      $currentIframe.attr('type','application/pdf');
      $inlinepdf.html($currentIframe);
    }});
    var pos = $(this).offset().top -50;
    $('html, body').animate({scrollTop:pos},300);

    //Add close button.
    var $closebtn = $("<div>");
    $closebtn.addClass('closepdfbutton');
    $closebtn.width($(this).width());
    $closebtn.text('Close PDF');
    $(this).parent().append($closebtn);

    $closebtn.click(function (){
      var orgCont = $(this).prev();
      orgCont.transition({height:$(this).prev().data('prevh')+'px', complete:function (){
        orgCont.find('.result-pdf-page').fadeIn();
        orgCont.css('pointer-events','auto');
      }});
      orgCont.find('.inlinepdf').html("");
      $(this).remove();
    });
  });

  //download button event
  $(".download-btns").click(function (){
    var pdfLink = $(this).data('pdflink');
    window.open(pdfLink, '_blank');
  });
  $(".download-btns").tooltip({delay: 50}).each(function (){
    $("#"+$(this).data('tooltip-id')).css("margin-top", "16px").css("margin-left", "-8px");
  });

  //Thumb up or down
  $(".thumb-up").click(function (){
    $(this).parent().find('.thumb-down').removeClass('thumb-active');
    $(this).addClass('thumb-active');
    //Push new feedback
    var feedbackObj = {
      oid : $(this).parent().data('oid'),
      id : $(this).parent().data('id'),
      data : {
        raw_passage: data.data[$(this).parent().data('id')].raw_passage,
        metadata : data.data[$(this).parent().data('id')].metadata,
        pdf_url : data.data[$(this).parent().data('id')].pdf_url,
        query : data.query,
        feedback : true,
        date : new Date()
      }
    }
    socket.emit('feedbackSend', feedbackObj);
  });
  $(".thumb-up").tooltip({delay: 50}).each(function (i, obj){
    $(obj).css("margin-top", "16px");
  });

  $(".thumb-down").click(function (){
    $(this).parent().find('.thumb-up').removeClass('thumb-active');
    $(this).addClass('thumb-active');
    //Push new feedback
    var feedbackObj = {
      oid : $(this).parent().data('oid'),
      id : $(this).parent().data('id'),
      data : {
        raw_passage: data.data[$(this).parent().data('id')].raw_passage,
        metadata : data.data[$(this).parent().data('id')].metadata,
        pdf_url : data.data[$(this).parent().data('id')].pdf_url,
        query : data.query,
        feedback : false,
        date : new Date()
      }
    }
    socket.emit('feedbackSend', feedbackObj);
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

socket.on('feedbackSaved', function (data){
  $(".thumb-div[data-id='"+data.id+"']").attr('data-oid',data.data._id);
});