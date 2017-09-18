var Admin = {
  RoutesMap: null,
  ShuttleRoutes: [],
  drawnRoute: null,
  RoutingControl: null,
  RoutingWaypoints: [],
  /*
  <div class = "route-description-box">
    <span class = "emphasis">name:</span><span class ="content"> West Campus</span><br>
    <span class = "emphasis">description:</span><span class ="content"> The west campus Red Hawk shuttle will make stops at the Student Union Horseshoe, Sage Ave & Troy Building crosswalks, Blitman Residence Commons, 6th Avenue and City Station, Polytechnic Residence Commons, and 15th Street and College Avenue. This shuttle route will have a yellow indicator labeled "WEST" on the front of the shuttle.</span><br>
    <span class = "emphasis">enabled:</span><span class="content">true</span><br>
    <span class = "emphasis">color:</span><span class="content">#fff</span><br>
    <span class = "emphasis">time:</span><span class="content">idek</span><br>
    <span class = "emphasis">id:</span><span class="content">13445213a</span><br>
    <div style="float: right;"><a class="button">edit</a><a class="button">delete</a></div><br>

  </div>
  */

  updateRoutes: function(data){
    var updatedRoute = [];
    for(var i = 0; i < data.length; i ++){
      var points = [];
      for(var j = 0; j < data[i].coords.length; j ++){
        points.push(new L.LatLng(data[i].coords[j].lat,data[i].coords[j].lng));
      }
      var polylineOptions = {
        color: data[i].color,
        weight: 3,
        opacity: 1,
      };
      if(data[i].width === 0){
        polylineOptions.dashArray = '10,10';
      }

      var polyline = new L.Polyline(points, polylineOptions);

      var r ={
        name: data[i].name,
        id: data[i].id,
        description: data[i].description,
        color: data[i].color,
        created: data[i].created,
        enabled: data[i].enabled,
        stops: data[i].stopsid,
        start_time: data[i].startTime,
        end_time: data[i].endTime,
        points: points,
        line: polyline
      };

      updatedRoute.push(r);

    }

    Admin.ShuttleRoutes = updatedRoute;
    Admin.drawRoutes();

  },


  drawRoutes: function(){

    var polylineOptions = {
      color: 'blue',
      weight: 1,
      opacity: 1
    };
    for(i = 0; i < Admin.ShuttleRoutes.length; i ++){
      Admin.RoutesMap.addLayer(Admin.ShuttleRoutes[i].line);
    }

  },

  populateRoutesPanel: function(data){
    $(".routePanel").html("");

    //console.log(data);
    //Admin.updateRoutes(data);
    if(data == null){

    }else{
      for(var i = 0; i < data.length; i ++){
        //console.log(data[i]);
        Admin.buildRouteBox(data[i]);

      }
      $(".deleteroute").click(function(){
        if ($(this).html() == "sure?"){
          $.ajax({
            url: '/routes/' + $(this).attr("routeId"),
            type: 'DELETE',
            success: function(result) {
              //Admin.populateRoutesPanel(data);
              $.get( "/routes", Admin.populateRoutesPanel);
            }
          });
        }else{
          $(this).html("sure?")
        }
      });
      $(".changeroute").click(function(){
      });

    }
  },
  populateRouteForm: function(data){

  },

  loadRoute: function(id){

  },

  buildRouteBox: function(routeInfo){
    var box = "";
    box += "<div id = " + routeInfo.id +" class = 'route-description-box'>";
    box += "<span class = 'emphasis'>name:</span><span class ='content'> " + routeInfo.name + "</span><br>";
    box += "<span class = 'emphasis'>description:</span><span class ='content'>" + routeInfo.description + "</span><br>"
    box += "<span class = 'emphasis'>enabled:</span><span class='content'>"+routeInfo.enabled + "</span><br>";
    box += "<span class = 'emphasis'>color:</span><span class='content'>" + routeInfo.color + "</span><br>";
    box += "<span class = 'emphasis'>time:</span><span class='content'>"+routeInfo.startTime + "-" + routeInfo.endTime + "</span><br>";
    box += "<span class = 'emphasis'>id:</span><span class='content'>"+ routeInfo.id + "</span><br>";
    box += "<div style='float: right;width:auto;'><button class='button cbutton changeroute' routeId="+routeInfo.id +">change</button><button id='delete' routeId="+routeInfo.id +" class='button cbutton deleteroute'>delete</button></div><br></div>"
    $(".routePanel").append(box);

  },

  routeDeleteHandler: function(info){
    //console.log(info);
  },

  showMapPanel: function(){
    $('.mapPanel').css('display','block');
    $('.routePanel').css('width','50%');
    Admin.RoutesMap.invalidateSize();
  },
  hideMapPanel: function(){
    $('.mapPanel').css('display','none');
    $('.routePanel').css('width','100%');
    Admin.RoutesMap.invalidateSize();
  },

  initMap: function(){
    Admin.RoutesMap = L.map('mapid', {
        zoomControl: false,
        attributionControl: false
    });

    Admin.RoutesMap.setView([42.728172, -73.678803], 15.3);
    Admin.RoutesMap.addControl(L.control.attribution({
        position: 'bottomright',
        prefix: ''
    }));

    L.tileLayer('http://tile.stamen.com/toner-lite/{z}/{x}/{y}{r}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
      minZoom: 13
    }).addTo(Admin.RoutesMap);

    Admin.RoutingControl = L.Routing.control({
      waypoints: [

      ],
      routeWhileDragging: true
    });

    Admin.RoutingControl.on('routeselected', function(e) {
      if (Admin.drawnRoute != null){
        Admin.RoutesMap.removeLayer(Admin.drawnRoute);
      }
      Admin.drawnRoute = L.polyline(e.route.coordinates, {color: 'blue'});
      Admin.drawnRoute.addTo(Admin.RoutesMap)

    });
    Admin.RoutingControl.addTo(Admin.RoutesMap);
    Admin.RoutingWaypoints =[

    ];

    Admin.RoutesMap.on('click', function(e) {
      Admin.RoutingWaypoints.push(e.latlng);
      Admin.RoutingControl.setWaypoints(Admin.RoutingWaypoints);
    });

  },
  removeLastPoint: function(){
    Admin.RoutingWaypoints = Admin.RoutingWaypoints.slice(0, -1);
    Admin.RoutingControl.setWaypoints(Admin.RoutingWaypoints);

  },
  pullForm: function(){
    var coords = [];
    coords = Admin.drawnRoute.getLatLngs();

    var toSend = {
      "name":$("#name").val(),
      "description":$("#desc").val(),
      "startTime":$("#startTimeDay").val() +";"+ $("#startTimeTime").val(),
      "endTime":$("#endTimeDay").val() +";"+ $("#endTimeTime").val(),
      "enabled":$("#en").val(),
      "color":$("#color").val(),
      "width":$("#width").val(),
      "coords":JSON.stringify(coords)};
    Admin.hideMapPanel();
    return toSend;

  },

  submitChange: function(){
      Admin.submitForm($('#jsonField').val());
      console.log($('#jsonField').val());
      $('.prompt').css('display','none');
  },

  getJson: function(){
    var toSend = Admin.pullForm()
    var wnd = window.open("about:blank", "", "_blank");
    wnd.document.write(JSON.stringify(toSend));

  },

  submitForm: function(toSend){
    $.ajax({
      url: "/routes/create",
      type: "POST",
      data: toSend,
      contentType: "application/json",
      complete: function(data){
        $.get( "/routes", Admin.populateRoutesPanel);
      }
    });

  }

};
$(document).ready(function(){
  Admin.initMap();
  $.get( "/routes", Admin.populateRoutesPanel);


});
