
function myFunction(test) {
    console.log(test);
  var popup = document.getElementById('_' + test);
  popup.classList.toggle("show");
}
// making AJAX request for data
var map6DataRequest = $.ajax({
  url: "map6.json",
  dataType: "json",
  success: console.log("Map6 data successfully loaded."),
  error: function(xhr) { alert(xhr.statusText); }
})

// making sure data request is complete before rendering map
$.when(map6DataRequest).done(function() {

    var records = map6DataRequest.responseJSON,
        i,
        id,
        map5,
        map6,
        marker;

    for (i = 0; i < records.length; i++) {

        record = records[i];
        records[i].country = '<span class="flag-icon flag-icon-' +
            records[i].code + '"></span><span> ' + records[i].country +
            '</span>';

        // creating hyperlink if a website exists
        if (records[i].website) {
            records[i].website = '<a href="' + records[i].website +
                '" target="_blank">Link</a>';
        } else {
            records[i].website = '';
        };

        // creating map popup if x and y coords exist
        if (records[i].x && records[i].y) {
            // creating unique id
            id = records[i].code + '_' + records[i].institution;


            // creating popup container
            records[i].location = '<div id="' + id +
                '" class="popup" onclick="myFunction(this.id)">Map' +
                '<span class="popuptext" id="_' + id +
                '"><div id="' + 'map_' + id +
                '" class="tableMap"></div></span></div>';

            // records[i].location = '<div id="' + 'map_' + id + '" class="tableMap"></div>'
        } else {
            records[i].location = ''
        };
    };

    console.log(records)


    $('#example').dynatable({
      dataset: {
        records: records
      }
    });

    // adding maps to records
    for (i = 0; i < records.length; i++) {
        mapID = 'map_' + records[i].code + '_' + records[i].institution;

        var elementExists = document.getElementById(mapID);
        if (elementExists) {
            console.log(elementExists);

            if (i ==5) {



                if (map5 != undefined) { map5.remove(); }

                // initializing map
                map5 = L.map(mapID, {
                  center: [records[i].y, records[i].x],
                  zoom: 15,
                  zoomControl: false,
                });
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map5);
                marker = L.marker([records[i].y, records[i].x]).addTo(map5);
            };


            if (i ==6) {



                if (map6 != undefined) { map6.remove(); }

                // initializing map
                map6 = L.map(mapID, {
                  center: [records[i].y, records[i].x],
                  zoom: 15,
                  zoomControl: false,
                });
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map6);

                marker = L.marker([records[i].y, records[i].x]).addTo(map6);
            };
        };



    };


    /*
    // creating simple map with location marker
    var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      name: 'tileLayer',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });


    // initializing map
    var map = L.map('map_' + id, {
      layers: tileLayer,
      center: [records[i].y, records[i].x],
      zoom: 10,
      zoomControl: false,
    });

    tileLayer.addTo(map);

    */

});
