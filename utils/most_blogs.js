const mostBlogs = (blogs) => {
  const message = 'Sorry i cant give you the favorite blog if there are no blogs'
  if (blogs.length === 0)
    return message
  const authors = blogs.map(blog => blog.author)
  if (blogs.length === 1) {
    const blog = {
      author: authors[0],
      blogs: 1
    }
    return blog
  }
  const authorsWithMode = authors.reduce((freq, author) => {
    if (freq.find(authorsWithBlogs => authorsWithBlogs.author === author)) {
      freq = freq.map(({ author: name, blogs }) => name === author ? { author: name, blogs: blogs + 1 }
        : { author: name, blogs })
    }
    else
      freq = [...freq, { author, blogs: 1 }]
    freq.sort((a,b) => b.blogs - a.blogs)
    return freq
  }, [])
  return authorsWithMode[0]
}

module.exports = mostBlogs