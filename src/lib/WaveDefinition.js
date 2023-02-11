export class WaveDefinition {
  wave = [];

  /**
   * @param {string} enemyType string
   * @param {'left' | 'center' | 'right'} lane 'left' | 'center' | 'right'
   * @param {number} quantity number
   * @param {number} startingAt number
   * @param {number} interval number (optional)
   */
  defEnemySeq(enemyType, lane, quantity, startingAt, interval = 1) {
    if (interval < 0.1) throw Error('minimum interval is 0.1');

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
