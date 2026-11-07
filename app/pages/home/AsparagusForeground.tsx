import {useId} from 'react';

const photoWidth = 1280;
const photoHeight = 1171;

// Shared edges between the visible spears, traced in the source photo's coordinates.
const edges = [
  [[0, 0], [0, photoHeight]],
  [[130, 0], [130, 400], [124, 600], [116, 850], [104, photoHeight]],
  [[290, 0], [290, 187], [272, 202], [250, 227], [234, 250], [221, 290], [216, 340], [208, 400], [200, 500], [193, 700], [183, photoHeight]],
  [[303, 0], [303, 198], [299, 250], [294, 300], [282, 350], [274, 400], [263, 500], [258, 650], [261, 900], [266, photoHeight]],
  [[391, 0], [391, 195], [375, 207], [358, 228], [348, 256], [344, 300], [342, 400], [340, 500], [349, 650], [352, 800], [350, 950], [342, photoHeight]],
  [[405, 0], [405, 250], [398, 300], [405, 350], [414, 400], [423, 500], [428, 650], [432, 800], [421, 1000], [407, photoHeight]],
  [[453, 0], [453, 250], [460, 300], [466, 350], [471, 450], [474, 600], [469, 800], [467, 1000], [468, photoHeight]],
  [[523, 0], [523, 250], [520, 350], [523, 500], [532, 650], [541, 800], [542, 950], [529, photoHeight]],
  [[581, 0], [582, 200], [590, 250], [595, 300], [587, 350], [584, 450], [591, 550], [599, 650], [607, 800], [614, 950], [610, photoHeight]],
  [[686, 0], [680, 128], [668, 143], [650, 150], [641, 164], [636, 192], [632, 230], [635, 260], [642, 280], [650, 310], [655, 350], [653, 400], [660, 480], [670, 600], [679, 750], [682, 900], [684, photoHeight]],
  [[721, 0], [728, 230], [742, 350], [740, 450], [746, 600], [752, 675], [752, 735], [750, 800], [752, photoHeight]],
  [[826, 0], [824, 200], [816, 300], [812, 400], [805, 500], [804, 650], [815, 800], [819, 900], [823, photoHeight]],
  [[912, 0], [912, 220], [907, 270], [900, 300], [891, 350], [884, 400], [875, 500], [868, 650], [880, 900], [890, photoHeight]],
  [[1009, 0], [1006, 200], [996, 300], [977, 400], [953, 500], [944, 650], [951, 900], [966, 1012], [968, 1123], [970, photoHeight]],
  [
    [1130, 0], [1130, 265], [1135, 293], [1105, 318], [1083, 345], [1065, 385],
    [1055, 420], [1045, 470], [1038, 530], [1030, 700], [1033, 900], [1047, photoHeight],
  ],
  [
    [1130, 0], [1130, 265], [1141, 340], [1136, 400], [1128, 460], [1118, 530],
    [1115, 595], [1115, 645], [1110, 690], [1110, 900], [1121, photoHeight],
  ],
  [[1231, 0], [1224, 200], [1210, 300], [1203, 390], [1197, 450], [1187, 650], [1195, 900], [1208, photoHeight]],
  [[photoWidth, 0], [photoWidth, photoHeight]],
];

const spears = edges.slice(1).map((right, index) => {
  const left = edges[index];
  return {
    pivot: (left[left.length - 1][0] + right[right.length - 1][0]) / 2,
    // A pixel of overlap keeps antialiased shared edges from showing seams.
    outline: [
      ...left.map(([x, y]) => `${x - 1},${y}`),
      ...[...right].reverse().map(([x, y]) => `${x + 1},${y}`),
    ].join(' '),
  };
});

export function AsparagusForeground() {
  const id = useId();
  const photoId = `${id}-photo`;

  return (
    <svg
      className="home-intro__asparagus"
      width={photoWidth}
      height={photoHeight}
      viewBox={`0 0 ${photoWidth} ${photoHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <image id={photoId} href="/images/rudimenterre/home-asparagus.webp" width={photoWidth} height={photoHeight} />
        {spears.map(({pivot, outline}) => (
          <clipPath key={pivot} id={`${id}-spear-${pivot}`}>
            <polygon points={outline} />
          </clipPath>
        ))}
      </defs>
      <use className="home-intro__asparagus-photo" href={`#${photoId}`} />
      <g className="home-intro__asparagus-spears">
        {spears.map(({pivot}) => (
          <g key={pivot} data-asparagus-pivot={pivot}>
            <use href={`#${photoId}`} clipPath={`url(#${id}-spear-${pivot})`} />
          </g>
        ))}
      </g>
    </svg>
  );
}
