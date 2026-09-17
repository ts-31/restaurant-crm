export const MENU_ITEMS = [
  {
    id: 'tagliatelle',
    name: 'Tagliatelle al Tartufo Nero',
    description: 'Hand-cut ribbon pasta tossed in mountain butter, topped with generous shavings of Norcia winter truffle, chives, and aerated organic parmesan cream foam.',
    price: 28.00,
    tags: ['Fresh Daily', 'Vegetarian'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb4BcpUgrg5uuPVJIXJATtA-xfWx8oyV0ZMPAPCi0SKobsNv0olD9HXwUmkXwFzlq87fB2_cMGnePhfyzZz3Fhbs0vhk1JMHF232cDtugW0VTGVY5wGFD2a1h8BuD6uoi75cJx4uZUZ_lnymU3tbjO5bm6ViVAroUnZSvi5UoMwgOzQFv8n223arltTmfGcs94i1oDVQ_l6rsy3j_DDwYO6FQ4f5KoCP2WosY8NSC9mlFhqW-PE2xN',
    type: 'signature',
    subtitle: 'Umbrian Black Winter Truffle · 24-Mo. Parmigiano'
  },
  {
    id: 'burrata',
    name: 'Burrata & San Marzano Pizza',
    description: 'Fermented 72-hour sourdough, scorched San Marzano D.O.P., pugliese torn burrata, cold-pressed Sicilian olive oil, sweet mountain basil.',
    price: 24.00,
    tags: ['Veg'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtwUuZhCtV4Zu-awFFHHygnM-1YmjXz0ZQ6DpkFv3wRucYcO4_RbpYgspcpybkEDk59ijN4MeYzWYu3d4v_12LtbzEqVZ3ht-t-tkvXW0hL1FsTS59AttcMDFQ7qEtBhwjbC3DVS595fNAKfmFrF5s_nMcvK1RzlrjV-w_Nwbg1NV6gRTHwWkGJleSkRN5NDsDBpLkLeALb2EAFs27PCeSdh6MI6eTertnKFqusdJqBNCNZCJnpIFS',
    type: 'pizza',
    meta: '12 min bake',
    badge: 'Wood Fired'
  },
  {
    id: 'old-fashioned',
    name: 'Smoked Rosemary Old Fashioned',
    description: 'Small-batch Kentucky bourbon, demerara, aromatic bitters, ignited organic rosemary essence over hand-carved ice sphere.',
    price: 18.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx58zYcj4UJlWC5NC_VRmp07Nl3GoMirGhNNlzj6e58mj89VTG2zUk-LySusQknjS5gpk0OxHpOHK5XgdptP2zsmOzeFsAb_Wb84n4jiY4iRjAmzKHh1HH5ynTvdXt4jLtMYrS77cdFNcuXLjBU6eJnfHSnW9cSZXgxjVnRRJoLSk1rlK_iR8AvazGy_UyrwEvoE9uudAnjPFNpdGx7anyvA8sr8lDlSj8uZ4561IqzKry7eprojLJ',
    type: 'drink',
    meta: 'Cellar Bar · 2.5 oz',
    badge: 'Bar Pick'
  },
  {
    id: 'cacio',
    name: 'Cacio e Pepe Croquettes',
    description: 'Crisp panko crust, molten center of Pecorino Romano DOP and toasted Sarawak peppercorn, roasted garlic lemon aioli.',
    price: 16.00,
    tags: ['Starter'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_RYzXGhXz_0tpjhEkEgEsxB3YSuFxLd98XPADZTjorQrQ6FEve6DVvBaUoWHrHk6K-vFx5mwIAuke7DQAfGINbd5jiq9bBeKSl_VEbOEKdWOhCkLjSu2Q0mwrV2OkyjRm7CaCywkl2XvDpW5tjmBbprCsZCmdFEZO6tChEMKljDqEqNUElMaPlcDjfwpT2_JoBTTIW7e-RW3X3E_nut5fiTcFqTJaRN87DpcAB1s4agNEodUXPV5S',
    type: 'starter'
  },
  {
    id: 'wagyu',
    name: 'Wagyu Ribeye Carpaccio',
    description: 'Marbled A5 Wagyu beef slices, caperberries, shallot pearls, cold-pressed Ligurian olive oil, Parmigiano ribbons.',
    price: 22.00,
    tags: ['Gluten-Free'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfD_jpBijxWombMTZeuPR5gUfDCvpXx4rZyUgW07uB6-dHd5Xvlm9IISDEks8L4PGfxWLYxnajEjEgp9RHTLqDDnDclUvP5F2Qpysok6cLXxCM1LpvO1mPZ5QFA3N-UZz8yB6bpsw9OTLpqyz6kfiwKfWYJULjL9vXWQk8xFj_7UUoIqSjUjnu6DkuTmDMIYy3L-2hIyqov22Gr_IgZias7Z_Bn7CmenJmlBOkNeain3Ixxj-XEveo',
    type: 'starter'
  }
];

export const CART_ITEMS = [
  {
    id: 'item-1',
    menuId: 'tagliatelle',
    name: 'Tagliatelle al Tartufo',
    price: 28.00,
    quantity: 1,
    note: 'Extra shaved parmesan, no butter sub',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNhQes4I7FYNkt1XgaeYhGUqZLSdVo7OtkaUY-d3h7AsSaTxqd_Nx0xmheAdU2EiZ5SAzDmboeE6TqQzB9k5Ha3pElAlPnyldAP_GBArfbchVdJFHrS0lwV6woJOGuv0Z_xcCceUIOK66FCpIxZzyztvyT9N__-5jV20vtisVdnkso_mnggTFI1NnSm1TtXF23K-Jp1JQwcnCIOrnpW9v-innbL-SjaqBqvCQ8wucdXU1uPygPiSJi',
    description: 'Fresh black winter truffle, hand-rolled pasta, aged butter'
  },
  {
    id: 'item-2',
    menuId: 'burrata',
    name: 'Burrata Margherita',
    price: 24.00,
    quantity: 1,
    note: 'Well done crust, sliced in 6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjbRHDos31rmiL3W4ltjGx4Mq1Un0vxEJNgQorsB_WT83qOEg13-Q9yYDdRn-7rKiN4Jzrqy3R1x_rqSYGWi3Lp_SjK8uKo19EoSqDbVFcmqdQKgf38Gb8xk1Ng3BTA_FES9sELK5d1XlBCpRx-kMjcs9n-jRjlcmK2TnfiTO_5k8xLAg0-XL95dgjuMVrk6UVsJ1UF818q39NjFbsLSVkY4d_3d42SiLR7qWCzrV7NmTPFkVXYOSI',
    description: 'San Marzano tomatoes, fresh basil, creamy pugliese burrata'
  },
  {
    id: 'item-3',
    menuId: 'old-fashioned',
    name: 'Smoked Rosemary Old Fashioned',
    price: 18.00,
    quantity: 1,
    note: 'Less sweet, orange twist',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjXeaFDqQnESL4cuJUy4XRlNiG50OsU8z9Wi4C0KxnSSVyoSI69hy7tIe9d8i_FMD2ixrIgKlhwFmIRcwei0EjTU21sNZzeqs5xrLKBEIBlwBAsi2FoG2H5Sx-fUAe7dBIR5t9SFtUM6ZA1VHhub8wc1pa_NDnm6bPRFpKMqEC_A1NVQTQmjBv4e-BuA7WPVuZNaIIGDXsrTiYX26D26g1v4H-ElzvUZvSoanhsLjV8M2XIIn4kVWR',
    description: 'Rye bourbon, torched rosemary twig, bitters, hand-carved ice'
  }
];
