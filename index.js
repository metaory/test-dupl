const fs = require('fs')
const faker = require('faker')
const server = require('./server')
const { log, error, clear } = console

clear()

const rand = () => Math.random() > 0.5

const write = (data, name) => fs.writeFileSync(`./${name}.json`, JSON.stringify(data, null, 2), { encoding: 'utf8' })

// PREPARE DUMMY CSV ///////////////////////////////////////////////////////////
const populateCSV = () =>
  write(Array.from({ length: 20 }).map(() => ({
    name: faker.name.firstName(),
    email: rand() ? faker.internet.email() : 'foo@bar.com'
  })), 'csv')

// LOAD DUMMY CSV //////////////////////////////////////////////////////////////
const loadCSV = () => require('./csv')

// REMOVE DUPL FROM CSV ////////////////////////////////////////////////////////
const parseCSV = (csv) =>
  csv.filter((x, i, arr) =>
    arr.findIndex(z => z.email === x.email) >= i
  )

// MAKE BATCHES FROM ARR ///////////////////////////////////////////////////////
const makeBatches = (arr, batchSize) => Array(Math.ceil(arr.length / batchSize))
  .fill().map((x, i) =>
    arr.slice(i * batchSize, i * batchSize + batchSize)
  )

// ////////////////////////////////////////////////////////////////////////// //
async function init () {
  await populateCSV()

  const CSV_DATA = await loadCSV()
  log('CSV_DATA\n', CSV_DATA.length)

  const parsedCSV = await parseCSV(CSV_DATA)
  log('PARSEDCSV\n', parsedCSV.length)

  const batches = await makeBatches(parsedCSV, 3)
  log('BATCHES\n', batches)

  const validBatches = await batches.reduce(async (acc, cur) =>
    [...(await acc),
      cur.filter(async x => (await server.checkDupl(cur.map(x => x.email)))
        .includes(x.email))]
  , Promise.resolve([]))
  log('VALIDEMAILS\n', validBatches)

  const flatBatch = validBatches.reduce((acc, cur) =>
    [...acc, ...cur]
  , [])
  log('FLATBATCH\n', flatBatch)

  const duplicates = parsedCSV.filter(x => flatBatch.indexOf(x))
  log('DUPLICATES\n', duplicates)

  const createBatch = makeBatches(flatBatch, 3)
  log('CREATEBATCH\n', createBatch)
}
// ////////////////////////////////////////////////////////////////////////// //

init()
  .then(log)
  .catch(error)

/*
*
*
*
*
*
*
*
*
*
*
*/
// arr.reverse().findIndex(z => z.email === x.email) === arr.indexOf(x)
