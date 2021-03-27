import faker from "faker"
import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 */
const seed = async () => {
  for (let i = 0; i < 45; i++) {
    await db.project.create({ data: { name: faker.name.findName() } })
  }
}

export default seed
