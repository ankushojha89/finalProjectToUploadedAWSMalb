var serverUrl=`https://elasticbeanstalk-us-east-2-048453914188.s3.us-east-2.amazonaws.com`;
var profileFolder=serverUrl+'/profileimages';

$( document ).ready( function() {
  
    // your code here
    listOfEmployees();
    
} );


function listOfEmployees(){
    $.ajax({
        type: 'GET',
        url: '/rest',       
        success: function(data) {
              //    console.log(data.employees);
              $('#employeesTable tbody').empty();

                 $.each(data.employees, function(i, item) {
                    console.log(item);       
                    var temp=`<tr><th scope="row">${i+1}</th>
                    <td width="10%"><img class="rounded-circle img-thumbnail" src="${profileFolder}/${item.profileimage}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td width="10%">${item.email}</td>
                    <td>${item.designation}</td>
                    <td width="10%">${item.createdAt}</td>
                    <td width="10%">${item.updatedAt}</td>
                      <td><a href="/details/${item._id}" class="btn btn-info" target="_blank">View</a> <a href="admin/edit/${item._id}" class="btn btn-success"> Edit</a> <button class="btn btn-danger" disabled> Delete</button> </td>
                  </tr>`;
                  $('#employeesTable tbody').append(temp);
                  

                });

        }
    });
}