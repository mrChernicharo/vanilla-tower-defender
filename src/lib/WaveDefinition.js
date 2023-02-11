export class WaveDefinition {
  wave = [];

  /**
   * @param {string} enemyType
   * @param {'left' | 'center' | 'right'} lane
   * @param {number} quantity
   * @param {number} interval
   * @param {number} startingAt,
   */
  defEnemySeq(enemyType, lane, quantity, interval, startingAt) {
    for (let i = 0; i < quantity; i++) {
      this.wave.push({
        type: enemyType,
        lane,
        delay: startingAt + interval * i,
      });
    }
    return this;
  }
}
