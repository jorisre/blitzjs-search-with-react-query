import React, { Suspense, useState } from "react"
import {
  Head,
  Link,
  useInfiniteQuery,
  BlitzPage,
  invokeWithMiddleware,
  InferGetServerSidePropsType,
} from "blitz"
import path from "path"
import Layout from "app/core/layouts/Layout"
import getProjects from "app/projects/queries/getProjects"

const ITEMS_PER_PAGE = 20

export const getServerSideProps = async (ctx) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const projects = await invokeWithMiddleware(
    getProjects,
    {
      orderBy: { id: "asc" },
      take: ITEMS_PER_PAGE,
    },
    ctx
  )

  return { props: { projects } }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

export const ProjectsList = ({ projects }: PageProps) => {
  const [searchText, setSearch] = useState("")

  const where = searchText ? { where: { name: { contains: searchText } } } : {}

  const [groups, { isFetchingMore, fetchMore, canFetchMore }] = useInfiniteQuery(
    getProjects,
    (page = { take: ITEMS_PER_PAGE, skip: 0 }) => {
      return { ...page, ...where }
    },
    {
      suspense: false,
      getFetchMore: (lastGroup) => lastGroup.nextPage,
      initialData: [projects], // It works without initialData
    }
  )

  console.log("Search:", searchText || undefined)

  return (
    <div>
      <input
        onChange={(e) => {
          setSearch(e.currentTarget.value)
        }}
        type="search"
        placeholder="Search a person..."
      />
      <ul>
        {groups &&
          groups.map((group, i) => (
            <React.Fragment key={i}>
              {group.projects.map((project) => (
                <li key={project.id}>
                  <Link href="/projects/[projectId]" as={`/projects/${project.id}`}>
                    <a>{project.name}</a>
                  </Link>
                </li>
              ))}
            </React.Fragment>
          ))}
      </ul>

      <button disabled={!canFetchMore} onClick={fetchMore}>
        {isFetchingMore ? "Loading..." : "Show more"}
      </button>
    </div>
  )
}

const ProjectsPage: BlitzPage<PageProps> = (props) => {
  return (
    <>
      <Head>
        <title>Projects</title>
      </Head>

      <div>
        <p>
          <Link href="/projects/new">
            <a>Create Project</a>
          </Link>
        </p>

        <ProjectsList {...props} />
      </div>
    </>
  )
}

ProjectsPage.authenticate = true
ProjectsPage.getLayout = (page) => <Layout>{page}</Layout>

export default ProjectsPage
