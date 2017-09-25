  //  $( document ).ready() block.
  var id ;
  $( document ).ready(function() {
    tinymce.init({
        selector: 'textarea#desc',
        height: 220,
        menubar: false  
      });

      var url = window.location.pathname;
      var id = url.substring(url.lastIndexOf('/') + 1);
      getEmployeeDetails(id);        
          
      editEmployeeForm(id);
});

function getEmployeeDetails(id){
    $.ajax({
        type: 'GET',
        url: '/rest/'+id,       
        success: function(data) {
                console.log(data.employee.name);

                $('#name').val(data.employee.name);
                $('#email').val(data.employee.email);
                $('#designation').val(data.employee.designation);
                $('#short_desc').val(data.employee.short_desc);
                $('#desc').val(data.employee.desc);
                $('#oldprofile').attr('src',`/images/profileimages/${data.employee.profileimage}`);
              
        }
    });
}

function editEmployeeForm(id){
    var frm = $('#editEmployee');
    
        frm.submit(function (e) {
            e.preventDefault();
    
            var form = new FormData($("#editEmployee")[0]);
            
          $.ajax({
                type: 'patch',
                enctype: 'multipart/form-data',
                dataType: 'json',
                url: '/rest/'+id,
                data: form,
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {            
                //    console.log('Submission was successful.');
                getEmployeeDetails(id);
                    document.getElementById("messages").innerHTML = 
                    "<div id='alert' class='alert alert-success alert-dismissible fade show' role='alert'>"+
                    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
                     " <span aria-hidden='true'>&times;</span> </button>  "+
                     " <strong>Employee updated successful.</strong></div>";                 
                     window.setTimeout(function () { $("#alert").alert('close'); }, 2000); 
                     
                },
                error: function (data) {            
                   
                  //  console.log('errors : ',data.responseJSON.message); 
                  //  console.log(data); 
                    document.getElementById("messages").innerHTML =       "<div id='alert' class='alert alert-danger alert-dismissible fade show' role='alert'>"+
                    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>"+
                     " <span aria-hidden='true'>&times;</span> </button>  "+
                     " <strong>"+data.responseJSON.message+"</strong></div>"; 
                     window.setTimeout(function () { $("#alert").alert('close'); }, 2000); 
                },
            });
        });   
    
}