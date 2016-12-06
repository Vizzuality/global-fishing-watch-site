import VesselsLayerOverlay from './VesselsLayerOverlay';
import VesselsLayerTiled from './VesselsLayerTiled';
import VesselsTileData from './VesselsTileData';
import { VESSEL_CLICK_TOLERANCE_PX } from '../../constants';


export default class VesselsLayer {

  constructor(map, tilesetUrl, token, filters, viewportWidth, viewportHeight, debug = false) {
    this.map = map;

    const innerStartDate = filters.timelineInnerExtent[0];
    const innerEndDate = filters.timelineInnerExtent[1];
    this.overallStartDateOffset = VesselsTileData.getTimeAtPrecision(filters.timelineOverallExtent[0]);

    this.currentInnerStartIndex = VesselsTileData.getOffsetedTimeAtPrecision(
        innerStartDate.getTime(),
        this.overallStartDateOffset
    );
    this.currentInnerEndIndex = VesselsTileData.getOffsetedTimeAtPrecision(
        innerEndDate.getTime(),
        this.overallStartDateOffset
    );

    this.overlay = new VesselsLayerOverlay(
      map,
      filters,
      viewportWidth,
      viewportHeight,
      debug
    );
    this.tiled = new VesselsLayerTiled(
      this.map,
      tilesetUrl,
      token,
      filters,
      this.overallStartDateOffset,
      debug
    );
    this.tiled.tileCreatedCallback = this._onTileCreated.bind(this);
    this.tiled.tileReleasedCallback = this._onTileReleased.bind(this);
  }

  updateFlag(flag) {
    this.overlay.setFlag(flag);
    this.tiled.setFlag(flag);
    this.render();
  }

  _onTileCreated() {
    // console.log(data)
    this.render();
  }

  _onTileReleased() {
    this.render();
  }

  show() {
    this.overlay.show();
    this.tiled.show();
  }

  hide() {
    this.overlay.hide();
    this.tiled.hide();
  }

  reposition() {
    this.overlay.repositionCanvas();
  }

  render() {
    this.overlay.render(this.tiled.tiles, this.currentInnerStartIndex, this.currentInnerEndIndex);
    // this.tiled.render(this.currentInnerStartIndex, this.currentInnerEndIndex);
  }

  renderTimeRange(start, end) {
    const startIndex = VesselsTileData.getOffsetedTimeAtPrecision(start, this.overallStartDateOffset);
    const endIndex = VesselsTileData.getOffsetedTimeAtPrecision(end, this.overallStartDateOffset);

    if (this.currentInnerStartIndex === startIndex && this.currentInnerEndIndex === endIndex) {
      return;
    }

    // console.log('???', startIndex, endIndex)

    this.currentInnerStartIndex = startIndex;
    this.currentInnerEndIndex = endIndex;

    // // console.log(startIndex)
    // this.render(startIndex, endIndex);
    this.render();
  }

  updateViewportSize(width, height) {
    this.overlay.updateViewportSize(width, height);
  }

  selectVesselsAt(x, y) {
    const tile = this.tiled.getTileAt(x, y);
    if (tile === null || tile.data === null) return [];

    const offsetedX = x - tile.box.left;
    const offsetedY = y - tile.box.top;

    const vessels = [];

    for (let f = this.currentInnerStartIndex; f < this.currentInnerEndIndex; f++) {
      const frame = tile.data[f];
      if (frame === undefined) continue;
      for (let i = 0; i < frame.x.length; i++) {
        const vx = frame.x[i];
        const vy = frame.y[i];
        if (vx >= offsetedX - VESSEL_CLICK_TOLERANCE_PX && vx <= offsetedX + VESSEL_CLICK_TOLERANCE_PX &&
            vy >= offsetedY - VESSEL_CLICK_TOLERANCE_PX && vy <= offsetedY + VESSEL_CLICK_TOLERANCE_PX) {
          vessels.push({
            value: frame.value[i],
            category: frame.category[i],
            series: frame.series[i],
            seriesgroup: frame.seriesgroup[i]
          });
        }
      }
    }
    return vessels;
  }

}
