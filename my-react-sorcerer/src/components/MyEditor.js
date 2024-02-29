import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
  SelectionState,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "../App.css";

const MyEditor = () => {
  const INLINE_STYLES = {
    BOLD: "BOLD",
    COLOR_RED: "COLOR_RED",
    UNDERLINE: "UNDERLINE",
    HIGHLIGHT: "HIGHLIGHT",
  };

  const toggleInlineStyle = (editorState, style) => {
    if (INLINE_STYLES[style]) {
      return RichUtils.toggleInlineStyle(editorState, INLINE_STYLES[style]);
    }
    return editorState;
  };

  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
  }, [editorState]);

  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (!newState && command === "space") {
      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const block = contentState.getBlockForKey(selection.getStartKey());
      const blockText = block.getText();

      if (blockText.trim() === "#" && selection.getStartOffset() === 1) {
        const newContentState = Modifier.setBlockType(
          contentState,
          selection,
          "header-one"
        );
        handleChange(
          EditorState.push(editorState, newContentState, "change-block-type")
        );
        return "handled";
      }

      if (blockText.trim() === "*" && selection.getStartOffset() === 1) {
        const newEditorState = toggleInlineStyle(
          editorState,
          INLINE_STYLES.BOLD
        );
        handleChange(newEditorState);
        return "handled";
      }

      if (blockText.trim() === "**" && selection.getStartOffset() === 2) {
        const newEditorState = toggleInlineStyle(
          editorState,
          INLINE_STYLES.COLOR_RED
        );
        handleChange(newEditorState);
        return "handled";
      }

      if (blockText.trim() === "***" && selection.getStartOffset() === 3) {
        const newEditorState = toggleInlineStyle(
          editorState,
          INLINE_STYLES.UNDERLINE
        );
        handleChange(newEditorState);
        return "handled";
      }
    }

    if (newState) {
      handleChange(newState);
      return "handled";
    }

    return "not-handled";
  };

 
  const handleBeforeInput = (char) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();

    if (char === "#" && selection.getStartOffset() === 0) {
      const newContentState = Modifier.setBlockType(
        contentState,
        selection,
        "header-one"
      );
      handleChange(
        EditorState.push(editorState, newContentState, "change-block-type")
      );
      return "handled";
    }

    const asteriskMatch = blockText.trim().match(/^\*+/);
    const numberOfAsterisks = asteriskMatch ? asteriskMatch[0].length : 0;
    if (char === " " && numberOfAsterisks === 1) {
      const newEditorState = toggleInlineStyle(editorState, INLINE_STYLES.BOLD);
      handleChange(newEditorState);
      return "handled";
    }

    if (char === " " && numberOfAsterisks === 2) {
      console.log("** cpn");

      // Toggle the inline style for red color
      const newEditorState = toggleInlineStyle(
        editorState,
        INLINE_STYLES.COLOR_RED
      );
      handleChange(newEditorState);
      return "handled";
    }

    if (char === " " && numberOfAsterisks === 3) {
      const newEditorState = toggleInlineStyle(
        editorState,
        INLINE_STYLES.UNDERLINE
      );
      handleChange(newEditorState);
      return "handled";
    }

    // Check for typing ``` and space
    if (char === "`" && blockText.endsWith("```")) {
      console.log("highlight");

      // Get the start and end offsets of the code block
      const startOffset = blockText.lastIndexOf("```");
      const endOffset = selection.getStartOffset();
      const length = endOffset - startOffset;

      // Apply inline style to highlight the text
      const contentStateWithHighlight = Modifier.applyInlineStyle(
        contentState,
        SelectionState.createEmpty(block.getKey()).merge({
          anchorOffset: startOffset,
          focusOffset: endOffset,
        }),
        "HIGHLIGHT"
      );

      // Update the editor state
      handleChange(
        EditorState.push(
          editorState,
          contentStateWithHighlight,
          "change-inline-style"
        )
      );
      return "handled";
    }

    return "not-handled";
  };

  const handleSave = () => {
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
    alert("Content saved successfully!");
  };

  return (
    <div className="editor">
      <h2>Demo Editor by Sneha</h2>
      <div className="editor-box">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          onChange={handleChange}
          // Add customStyleMap to apply color styles
          customStyleMap={{
            COLOR_RED: { color: "red" },
            HIGHLIGHT: { backgroundColor: "YELLOW" },
          }}
        />
      </div>
      <button onClick={handleSave} className="save-btn">
        Save
      </button>
    </div>
  );
};

export default MyEditor;
