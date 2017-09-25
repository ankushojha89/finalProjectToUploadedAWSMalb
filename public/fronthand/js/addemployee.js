  //  $( document ).ready() block.
$( document ).ready(function() {
    tinymce.init({
        selector: 'textarea#desc',
        height: 220,
        menubar: false  
      });
      var frm = $('#addemployee');
      
          frm.submit(function (e) {
              e.preventDefault();
      
              var form = new FormData($("#addemployee")[0]);
              
            $.ajax({
                  type: frm.attr('method'),
                  enctype: 'multipart/form-data',
                  dataType: 'json',
                  url: frm.attr('action'),
                  data: form,
                  processData: false,
                  contentType: false,
                  cache: false,
                  success: function (data) {
                      document.getElementById("addemployee").reset();
                      console.log('Submission was successful.');
                      document.getElementById("messages").innerHTML = 
                      "<div id='alert' class='alert alert-success alert-dismissible fade show' role='alert'>"+
                      "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
                       " <span aria-hidden='true'>&times;</span> </button>  "+
                       " <strong>New employee added successful.</strong></div>";                 
                       window.setTimeout(function () { $("#alert").alert('close'); }, 2000); 
                  },
                  error: function (data) {               
                     
                  //    console.log('errors : ',data.responseJSON.message); 
                    //  console.log(data); 
                      document.getElementById("messages").innerHTML =       "<div id='alert' class='alert alert-danger alert-dismissible fade show' role='alert'>"+
                      "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
                       " <span aria-hidden='true'>&times;</span> </button>  "+
                       " <strong>"+data.responseJSON.message+"</strong></div>"; 
                       window.setTimeout(function () { $("#alert").alert('close'); }, 2000); 
                  },
              });
          });   
      
         
});