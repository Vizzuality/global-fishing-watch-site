import React, { Component } from 'react';

class MapIFrame extends Component {

  render() {
    return (
      <iframe
        style={{ border: 0, width: '100%', height: '100%' }}
        src={EMBED_MAP_URL}
      />
    );
  }
}

export default MapIFrame;