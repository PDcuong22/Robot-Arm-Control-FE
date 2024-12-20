import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import './map.css';

function Map() {
  const mapRef: any = useRef();
  const mapContainerRef: any = useRef();

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZnRzcGlyaXQiLCJhIjoiY2xqcHZvZTQyMDBrcjNmcmZnMnhjaTVzbiJ9.nBhkizgbiNgxNfSnsyyBZw';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default Map;
