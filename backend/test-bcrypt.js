const bcrypt = require('bcryptjs');
async function test() {
  const hash = "$2b$10$j2OUkENEl2nEQ0PpUImXOef1lHqCSfRiWmyRq8IDGHsGP1l1LK9.y";
  const pass = "AdminGubernur123!";
  const isValid = await bcrypt.compare(pass, hash);
  console.log("Is password valid?", isValid);
}
test();
