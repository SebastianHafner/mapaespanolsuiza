L.Control.StaticOverview = L.Control.extend({
  options: {
    position: 'bottomright'
  },
  
  // In order to keep the overview map in sync with the main map, each layer
  // must have a 'name' attribute
  // 
  // e.g. var osm = L.tileLayer('http://...', name: 'osm', attribution: ...)
  initialize: function(layers, staticOptions) {
    this._layers = layers;
    this._currentBaseLayer = layers[0];
	
	this._staticBounds = staticOptions.bounds;
	this._staticZoom = staticOptions.zoom;
	this._staticCenter = staticOptions.center;
	
	
	console.log('initialized', this._staticZoom);
  },
  
  onAdd: function(map) {
    this._map = map;
    this._initLayout();
    this._update();
	
	console.log('onAdd');
	
    map.on('moveend', this._update, this);
    map.on('baselayerchange', this._changeBaseLayer, this);
    
    return this._container;
  },
  
  onRemove: function(map) {
    map.off('moveend', this._update, this);
    map.off('baselayerchange', this._changeBaseLayer, this);
  },
  
  _initLayout: function() {
	  
	// define size of overview map
	var ratio = 10;
	var size = this._map.getSize();
	this._width = size.x / ratio;
	this._height = size.y / ratio;
	
	// console.log('width', this._width, 'height', this._height);
	
	
    var container = this._container = L.DomUtil.create('div', 'leaflet-control-overview'), 
        mapDiv    = L.DomUtil.create('div', 'leaflet-control-overview-map', container);
	
    var overview = this._overview = new L.Map(mapDiv, {
      layers:             [this._currentBaseLayer],
      dragging:           false,
      touchZoom:          false,
      scrollWheelZoom:    false,
      doubleClickZoom:    false,
      boxZoom:            false,
      zoomControl:        false,
	  zoomSnap:				0,
      attributionControl: false
    });
	
    var rectangle = this._rectangle = new L.Rectangle(this._map.getBounds(), {weight: 2, clickable: false, color: '#4183c4'});
    overview.addLayer(rectangle);
	setTimeout(function() { overview.invalidateSize(); });  // hack
  },
  
  _update: function() {
    // var center = this._map.getCenter(), zoom = Math.max(this._map.getZoom() - 4, 0);
    this._rectangle.setBounds(this._map.getBounds());
    this._overview.fitBounds(this._staticBounds);
	this._overview.setView(this._staticCenter, this._staticZoom-3);
	
	console.log('static options' , this._staticZoom);
	console.log('zoom overview', this._overview.getZoom());
  },
  
  _changeBaseLayer: function(e) {
    var layer, name = e.layer.options.name;
    for (var i = 0; i < this._layers.length; i++) {
      layer = this._layers[i];
      if (layer.options.name === name && this._currentBaseLayer.options.name !== name) {
        this._overview.removeLayer(this._currentBaseLayer);
        this._overview.addLayer(layer, true);
        this._currentBaseLayer = layer;
        break;
      }
    }
	console.log('change baselayer');
  }
});

L.control.StaticOverview = function(layer, options) {
  return new L.Control.StaticOverview(layer, options);
};