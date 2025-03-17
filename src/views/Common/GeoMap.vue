<template>
    <div>
        <l-map :zoom="zoom" :center="center" :attribution-control="false" style="height: 300px; width: 100%;" @click="onMapClick">
            <l-tile-layer
                :url="url"
                :attribution="attribution"
            />
            <l-marker v-if="latLng" @click="locationClick()" :lat-lng="latLng">
                <l-popup>{{ popupText }}</l-popup>
            </l-marker>
            <l-marker @click="customLocationClick" v-if="clickedLatLng" :lat-lng="clickedLatLng" :icon="redIcon">
                <l-popup>{{ popupText }}</l-popup>
            </l-marker>
        </l-map>
    </div>
</template>

<script>
/* eslint-disable */
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const redIcon = new L.Icon({
    iconUrl: '/img/marker.png',
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [40, 45],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [40, 50],
    shadowAnchor: [5, 48]
});

export default {
    name : "geoMap",
    props: {
        locationGeo : {
            type : Object,
            required : true,
            default : function() {
                return {}
            },
        }
    },
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LPopup
    },
    data () {
        return {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            zoom: 8,
            center: [21, 106],
            latLng: null,
            attribution: '&copy; <a href="https://automationandtesting.vn/" target="_blank">Open ATDigitalTester Map</a> contributors',
            popupText: '',
            clickedLatLng: null,
            redIcon,
        };
    },
    methods: {
        async onMapClick(e) {
            this.clickedLatLng = e.latlng;
        },
        async loadMap(data, sign) {
            let attributionLinks = document.querySelectorAll('.leaflet-control-attribution a[href*="leaflet"]');
            attributionLinks.forEach(link => {
                link.href = 'https://automationandtesting.vn/';
                link.title = 'AT Energy';
                link.innerHTML = '<img style="width : 15px; height:15px;" src="/img/favicon.png"> AT Energy';
            });

            if(sign == true) {
                if(data != undefined) {
                    this.center = [data.x, data.y, data.z]
                    this.latLng = [data.x, data.y, data.z]
                    this.zoom = 8
                }
            } else {
                this.center = [21, 106]
                this.latLng = null
                this.clickedLatLng= null
                this.popupText = ''
                this.zoom = 8
            }
        },
        async locationClick() {
            if(this.center.length == 3) {
                if(this.center[2] == '' || this.center[2] == undefined) {
                    this.popupText = 'Geo coordinate at (' + this.center[0] + ',' + this.center[1] + ')'
                } else {
                    this.popupText = 'Geo coordinate at (' + this.center[0] + ',' + this.center[1] + ',' + this.center[2] + ')'
                }
            } else {
                this.popupText = 'Geo coordinate at (' + this.center[0] + ',' + this.center[1] + ')'
            }
        },
        async customLocationClick() {
            this.popupText = 'Geo coordinate at (' + this.clickedLatLng.lat + ',' + this.clickedLatLng.lng + ')'
        }
    }
}
</script>
<style>
.leaflet-control-attribution a[href*="leaflet"] {
  display: none;
}
.custom-attribution {
  font-size: 14px;
  color: #333;
}

.custom-attribution img {
  height: 16px;
  vertical-align: middle;
  margin-right: 5px;
}
</style>