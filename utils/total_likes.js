const totalLikes = (blogs) => {
  return blogs.length === 0 ? 0 : blogs.reduce((total,blog) => {
    return total += blog.likes
  },0)
}

module.exports = totalLikes