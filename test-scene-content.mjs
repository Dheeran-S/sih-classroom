fetch("http://localhost:3000/api/generate/scene-content", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    outline: { title: "Test Scene", type: "content", description: "Hello", id: "1" },
    allOutlines: [{ title: "Test Scene", type: "content", description: "Hello", id: "1" }],
    stageInfo: { name: "Test Stage" },
    stageId: "test-stage-id"
  })
}).then(res => res.text()).then(console.log).catch(console.error);
