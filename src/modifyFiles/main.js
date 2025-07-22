import { app } from "electron";

app.on("browser-window-created", (_, win) => {
  win.setBackgroundMaterial("mica");
  win.setBackgroundColor("#00000000");
});
