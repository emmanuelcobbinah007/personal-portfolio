/** Geniy mascot — stroke-only ink sketch (cocoa draw). */
export const geniyViewBox = "0 0 200 240";

export const geniyPaths = [
  // Head outline (slightly imperfect circle)
  `M 148 78
   C 148 105 128 126 100 126
   C 72 126 52 105 52 78
   C 52 51 72 30 100 30
   C 128 30 147 50 148 78 Z`,

  // Left glasses lens
  `M 98 78
   C 98 87 91 94 82 94
   C 73 94 66 87 66 78
   C 66 69 73 62 82 62
   C 91 62 98 69 98 78 Z`,

  // Right glasses lens
  `M 134 78
   C 134 87 127 94 118 94
   C 109 94 102 87 102 78
   C 102 69 109 62 118 62
   C 127 62 134 69 134 78 Z`,

  // Bridge
  `M 98 76 L 102 76`,

  // Left temple
  `M 66 74
   C 58 72 52 68 48 64`,

  // Right temple
  `M 134 74
   C 142 72 148 68 152 64`,

  // Left eye
  `M 84 78
   C 84 79.2 83.1 80 82 80
   C 80.9 80 80 79.2 80 78
   C 80 76.8 80.9 76 82 76
   C 83.1 76 84 76.8 84 78 Z`,

  // Right eye
  `M 120 78
   C 120 79.2 119.1 80 118 80
   C 116.9 80 116 79.2 116 78
   C 116 76.8 116.9 76 118 76
   C 119.1 76 120 76.8 120 78 Z`,

  // Smile
  `M 90 94
   C 94 100 106 100 110 94`,

  // Body + wispy tail (one continuous silhouette)
  `M 78 122
   C 72 138 74 158 82 172
   C 88 182 94 188 102 190
   C 112 192 124 186 138 172
   C 152 156 164 148 172 150
   C 166 142 152 146 140 156
   C 128 168 116 176 106 174
   C 96 172 90 162 88 148
   C 86 136 90 126 98 122`,

  // Left arm (holding book)
  `M 78 128
   C 68 136 62 148 64 156
   C 66 162 74 164 82 158`,

  // Right arm
  `M 122 128
   C 132 136 140 148 138 156
   C 136 162 128 164 120 158`,

  // Book cover left
  `M 72 148
   L 72 178
   L 98 186
   L 98 154 Z`,

  // Book cover right
  `M 128 148
   L 128 178
   L 102 186
   L 102 154 Z`,

  // Book spine / center fold
  `M 100 152 L 100 186`,

  // Left page glow edge
  `M 76 152
   C 84 156 92 158 98 158`,

  // Right page glow edge
  `M 124 152
   C 116 156 108 158 102 158`,

  // Sparkle top-left (4-point)
  `M 42 36 L 44 42 L 50 44 L 44 46 L 42 52 L 40 46 L 34 44 L 40 42 Z`,

  // Sparkle top-right
  `M 168 28 L 170.5 35 L 178 37 L 170.5 39 L 168 46 L 165.5 39 L 158 37 L 165.5 35 Z`,

  // Sparkle mid-right
  `M 176 90 L 177.5 94 L 182 95.5 L 177.5 97 L 176 101 L 174.5 97 L 170 95.5 L 174.5 94 Z`,

  // Sparkle from book
  `M 150 122 L 151.5 126 L 156 127.5 L 151.5 129 L 150 133 L 148.5 129 L 144 127.5 L 148.5 126 Z`,

  // Small sparkle left of book
  `M 54 162 L 55 165 L 58 166 L 55 167 L 54 170 L 53 167 L 50 166 L 53 165 Z`,
] as const;
