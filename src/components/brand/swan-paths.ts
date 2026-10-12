// Trazos del emblema (brand/cisne-emblema.png), en coordenadas del PNG original.
// Cada trazo tiene su grosor: el original afina las puntas como una pluma.
export const SWAN_VIEWBOX = '325 375 585 670'

export const SWAN_STROKES: ReadonlyArray<{ d: string; w: number }> = [
  // Cabeza, cuello y costado derecho del corazón, hasta la punta inferior
  {
    d: 'M686 505 C682 440 730 396 790 394 C845 394 880 435 880 480 L872 510 M686 505 C690 585 760 630 815 672 C870 715 888 770 874 830 C860 880 800 930 740 975 C710 998 690 1015 672 1028',
    w: 7,
  },
  // Ala izquierda: lóbulo superior del corazón
  {
    d: 'M642 612 C615 535 555 490 495 488 C410 488 348 560 346 640 C346 725 410 790 495 808 C550 820 595 825 625 842',
    w: 7,
  },
  // Pluma interior larga
  {
    d: 'M404 585 C410 640 450 680 520 695 C580 705 640 712 690 740 C725 765 740 815 746 856',
    w: 5,
  },
  // Costado inferior izquierdo
  { d: 'M430 806 C455 850 520 895 580 930 C625 957 655 985 672 1028', w: 6 },
  // Pluma inferior
  { d: 'M515 886 C560 900 620 908 660 935', w: 4 },
  // Pestaña / ojo
  { d: 'M803 458 C800 485 815 503 845 508 C855 495 852 475 840 462', w: 3.5 },
  // Pico
  { d: 'M846 508 L881 574', w: 11 },
]
