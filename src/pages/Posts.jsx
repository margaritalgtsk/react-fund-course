import React, {useEffect, useRef, useState} from "react";

import {usePosts} from "../hooks/usePosts";
import {useFetching} from "../hooks/useFetching";
import PostService from "../API/PostService";
import {getPageCount} from "../utils/pages";
import MyButton from "../components/UI/button/MyButton";
import MyModal from "../components/UI/MyModal/MyModal";
import PostForm from "../components/PostForm";
import PostFilter from "../components/PostFilter";
import Loader from "../components/UI/Loader/Loader";
import PostList from "../components/PostList";
import Pagination from "../components/UI/pagination/Pagination";
import {useObserver} from "../hooks/useObserver";
import MySelect from "../components/UI/select/MySelect";

function Posts() {
    const [posts, setPosts] = useState([])

    // состояние - обьект досерж 2 поля, выбранная сортировка и поисковой запрос
    const [filter, setFilter] = useState({sort: '', query: ''})
    const [modal, setModal] = useState(false)

    const [totalPages, setTotalPages] = useState(0);
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)

    const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query)

    const lastElement = useRef();

    //вызов хука useFetching
    const [fetchPosts, isPostsLoading, postError] = useFetching (async (limit, page) => {
        const response = await PostService.getAll(limit, page);
        setPosts([...posts, ...response.data])
        // текст внутри и есть коллбэк

        const totalCount = response.headers['x-total-count']
        setTotalPages(getPageCount(totalCount, limit))
    })

    useObserver(lastElement, page < totalPages, isPostsLoading, () => {
        setPage(page + 1);
    })

    // useEffect следить за стадиями жизненного цикла компонента
    //без зависимостей единожды, загружаем посты
    useEffect(() => {
        fetchPosts(limit, page)
    },[page, limit])

    // функция ожидает на выходе новый пост и добавляет к списку сущ-их постов
    const createPost = (newPost) => {
        setPosts([...posts, newPost])
        setModal(false)
    }


    //вернет все посты, которые не равны передаваеому id
    const removePost = (post) => {
        setPosts(posts.filter(p => p.id !== post.id))

    }

    const changePage = (page) => {
        setPage(page)
    }

    return (
        <div className="App">
            <MyButton style={{marginTop: 30}} onClick={() => setModal(true)}>
                Создать пост
            </MyButton>
            <MyModal visible={modal} setVisible={setModal}>
                <PostForm create={createPost}/>
                {/*передаем функцию обратного вызова createPost в дочерний компонент*/}
            </MyModal>

            <hr style={{margin: '15px 0'}}/>

            {/*в дочерний компонент передаем состояние и функцию которая изменяет состояние*/}
            <PostFilter
                filter={filter}
                setFilter={setFilter}
            />
            <MySelect
                value={limit}
                onChange={value => setLimit(value)}
                defaultValue="Кол-во элементов на странице"
                options={[
                    {value: 5, name: '5'},
                    {value: 10, name: '10'},
                    {value: 15, name: '15'},
                    {value: 20, name: '20'},
                    {value: -1, name: 'Показать все'}
                ]}

            />
            {postError &&
            <h1>Произошла ошибка  ${postError}</h1>
            }
            {/*меняем постраничный вывод на бесконечную подгрузку*/}
            {/*{isPostsLoading
                ?  <div style={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}><Loader/></div>
                : <PostList remove={removePost} posts={sortedAndSearchedPosts} title={'Список постов 1'}/>
            }*/}
            <PostList remove={removePost} posts={sortedAndSearchedPosts} title={'Список постов'}/>

            <div ref={lastElement}/>
            {isPostsLoading &&
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}><Loader/></div>
            }
            {/*<Pagination
                totalPages={totalPages}
                page={page}
                changePage={changePage}
            />*/}
        </div>
    );
}

export default Posts;