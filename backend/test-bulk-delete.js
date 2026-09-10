async function test() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "operator@sulsel.go.id", password: "Operator123!" })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  
  const delRes = await fetch("http://localhost:5000/api/surat/bulk", {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ ids: [21] })
  });
  const delData = await delRes.json();
  console.log(delData);
}

test();
