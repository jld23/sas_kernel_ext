const JupyterLab = require("@jupyterlab/application");
const CommandRegistry = require("@lumino/commands");

module.exports = {
  id: "sas-libnames-extension",
  activate(app) {
    console.log("Activating SAS Libnames Extension...");

    const command = CommandRegistry.createCommand({
      label: "Add SAS Libnames Column",
      caption: "Add SAS Libnames Column"
    });

    app.commands.addCommand(command, {
      execute: () => {
        console.log("Executing Add SAS Libnames Column command...");

        // Get the current Notebook instance
        const notebook = JupyterLab.notebook;

        // Check if the Notebook instance is valid
        if (notebook) {
          console.log("Notebook instance is valid.");

          // Add a new column to the left-hand side of the Notebook
          notebook.addColumn(0, "SAS Libnames");

          // Get the current list of columns
          const columns = notebook.getColumns();

          // Check if the SAS Libnames column was added successfully
          if (columns.length > 1) {
            console.log("SAS Libnames column was added successfully.");

            // Listen for changes to the Notebook instance
            notebook.widgetChanged.connect((sender, args) => {
              console.log("Notebook widget changed:", args);

              // Check if the change was to a new sheet
              const sheet = sender.activeCell;
              if (sheet) {
                console.log("Sheet changed:", sheet);

                // Get the file path for the current sheet
                const filePath = notebook.getFilePath(sheet);

                // Check if the file path is valid
                if (filePath) {
                  console.log("File path is valid.");

                  // Read the contents of the SAS libnames file
                  readFile(filePath, (error, data) => {
                    if (error) {
                      console.error("Error reading SAS libnames file:", error);
                    } else {
                      console.log("SAS libnames file contents:", data);

                      // Parse the contents of the SAS libnames file
                      const libnames = parseLibnames(data);

                      // Check if any SAS libnames were found
                      if (libnames) {
                        console.log("SAS libnames found:", libnames);

                        // Display the list of SAS libnames in a new tab
                        displayLibnames(libnames);
                      } else {
                        console.log("No SAS libnames found.");
                      }
                    }
                  });
                } else {
                  console.log("File path is not valid.");
                }
              } else {
                console.log("Sheet changed:", sheet);
              }
            });
          } else {
            console.error("SAS Libnames column was not added successfully.");
          }
        } else {
          console.error("Notebook instance is invalid.");
        }
      },
      iconClass: "fa fa-book",
      label: "Add SAS Libnames Column",
      caption: "Add SAS Libnames Column"
    });

    // Add the command to the Notebook toolbar
    notebook.toolbar.addItem("sas-libnames-extension", command);
  },
  autoStart: true,
  activate() {
    console.log("SAS Libnames Extension Activated.");
  }
};
