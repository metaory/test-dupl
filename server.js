const { log } = console

const rand = () => Math.random() > 0.5

exports.checkDupl = async (list) => {
  console.log('LIST', list)
  return list.filter(() => rand())
}
