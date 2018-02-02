class EasingFunctions {
  static easeOutQuad(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
  }
}

module.exports = EasingFunctions;