export const fileSystem = {
    name: "src",
    isFolder: true,
    children: [
      {
        name: "index.js",
        isFolder: false,
      },
      {
        name: "components",
        isFolder: true,
        children: [
          {
            name: "App.js",
            isFolder: false,
          },
          {
            name: "Header",
            isFolder: true,
            children: [
              {
                name: "Header.js",
                isFolder: false,
              },
              {
                name: "HeaderStyles",
                isFolder: true,
                children: [
                  {
                    name: "styles.css",
                    isFolder: false,
                  },
                  {
                    name: "themes",
                    isFolder: true,
                    children: [
                      {
                        name: "dark.css",
                        isFolder: false,
                      },
                      {
                        name: "light.css",
                        isFolder: false,
                      },
                      {
                        name: "extra",
                        isFolder: true,
                        children: [
                          {
                            name: "colors.css",
                            isFolder: false,
                          },
                          {
                            name: "fonts.css",
                            isFolder: false,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "assets",
        isFolder: true,
        children: [
          {
            name: "images",
            isFolder: true,
            children: [
              {
                name: "logo.png",
                isFolder: false,
              },
              {
                name: "background.jpg",
                isFolder: false,
              },
              {
                name: "icons",
                isFolder: true,
                children: [
                  {
                    name: "home.svg",
                    isFolder: false,
                  },
                  {
                    name: "settings.svg",
                    isFolder: false,
                  },
                ],
              },
            ],
          },
          {
            name: "fonts",
            isFolder: true,
            children: [
              {
                name: "Roboto.ttf",
                isFolder: false,
              },
              {
                name: "OpenSans.ttf",
                isFolder: false,
              },
            ],
          },
        ],
      },
    ],
  };
  