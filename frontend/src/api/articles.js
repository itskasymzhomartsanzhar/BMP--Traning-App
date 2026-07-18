import client from './client'

export const getArticles = (params) => client.get('/articles/', { params })
export const getArticleCategories = () => client.get('/articles/categories/')
export const getArticle = (id) => client.get(`/articles/${id}/`)
