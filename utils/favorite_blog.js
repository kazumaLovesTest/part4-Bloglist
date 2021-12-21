const favorite = (blogs) => {
  const message = 'Sorry i cant give you the favorite blog if there are no blogs'
  return blogs.length === 0 ? message : filtered(blogs)
}
const filtered = (blogs) => {
  const result =  blogs.sort((a,b) => b.likes - a.likes)[0]
  console.log(result)
  return result
}
module.exports = favorite