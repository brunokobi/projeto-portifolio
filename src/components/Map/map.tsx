import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const styles = {
  container: {
    height: "567px",
  },
  mapDiv: {
    height: "100%",
  },
};

function Map() {
  const mapDivRef = useRef(null);

  useEffect(() => {
    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/Graphic",
    ]).then(([Map, MapView, FeatureLayer, Graphic]) => {
      // criação do mapa
      const map = new Map({ basemap: "hybrid" });

      // criação da view
      const view = new MapView({
        container: mapDivRef.current,
        map: map,
        zoom: 4,
        center: [0, 0],
      });

     // criação da forma geométrica polígono
     const polygon = {
      type: "polygon", // autocasts as new Polygon()
      rings: [
        [-40.29003, -20.31573],
        [-40.28995, -20.31557],
        [-40.28957, -20.31572],
        [-40.28964, -20.31588],
        [-40.29003, -20.31573],
      ],
    };

    // criação da forma geométrica ponto
    const point = {
      type: "point",
      longitude: -40.29003,
      latitude: -20.31573,
    };

    // criação do simbolo azual bolinha
    // let markerSymbol = {
    //   type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    //   color: [0, 183, 235],
    // }

    // criação do simbolo vermelho seta
    var simboloPadrao = {
      type: "simple-marker",
      path: "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z",
      color: "red",
      size: 24,
    };

    //componente da camada
    const rendererPoint = {
      type: "unique-value",
      field: "activity_type",
      defaultSymbol: simboloPadrao,
    };

    //estilo do texto do point label
    const labelSymbol = {
      type: "text",
      color: "#ffffff",
      font: {
        family: "Arial",
        size: 12,
        weight: "normal",
      },
      haloColor: "#000000",
      haloSize: 2,
    };

    //texto da label da camada
    const pointLabelClass = {
      symbol: labelSymbol,
      labelPlacement: "below-center",
      labelExpressionInfo: {
        expression: "return 'Ambipar' ",
        title: "",
      },
    };

    //criação do simbolo do grafico
    const fillSymbol = {
      type: "simple-fill",
      color: [0, 183, 235, 0.1],
      outline: {
        color: [255, 255, 0],
        width: 1,
      },
    };

    //pop-up da camada
    const popupTemplate = {
      title: "Ambipar Orbit - Base",
      content: "Ambipar Orbit - Base",
    };

    //grafico
    const graphic2 = new Graphic({
      geometry: polygon,
      symbol: fillSymbol,
    });

    //grafico
    const graphic = new Graphic({
      geometry: point,
      symbol: fillSymbol,
    });

    //criação de uma camada para exibição
    const layer = new FeatureLayer({
      title: "Empreendimentos (Pontos)",
      source: [graphic], // array de graficos
      objectIdField: "ObjectID",
      geometryType: "point",
      outFields: ["*"],
      spatialReference: { wkid: 4326 }, // padrão especial da camada
      renderer: rendererPoint,
      labelingInfo: [pointLabelClass],
      popupTemplate: popupTemplate, // popup do ponto
      labelsVisible: true,
    });

    //adiciona a camada no mapa
    map.add(layer);

    //adiciona o grafico no mapa
    view.graphics.add(graphic2);

    //visão inicial ir pra o ponto e zoom
    let opts = {
      duration: 3000, // Duration of animation will be 5 seconds
    };

    //visão inicial ir pra o ponto e zoom
    view.goTo(
      {
        target: [-40.29003, -20.31573],
        zoom: 16,
      },
      opts
    );
  

    });

    // Cleanup function
    return () => {
      // Limpar recursos do ESRI quando o componente for desmontado
    };
  }, []);

  return (
    <div className="card-body">
      <div style={styles.container}>
        <div ref={mapDivRef} style={styles.mapDiv}></div>{" "}
      </div>
    </div>
  );
}

export default Map;


