import Widget from 'flarum/extensions/afrux-forum-widgets-core/common/components/Widget';
import app from 'flarum/forum/app';
import getTags from '../helpers/getTags';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';

export default class PopularTags extends Widget {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
  }

  oncreate(vnode) {
    super.oncreate(vnode);
    const showedTags = app.forum.attribute('justoverclock-popular-tags.numberOfTags') || 4;

    // [新增]：修复右侧虚化问题
    // 找到父级容器 (.AfruxWidgets-Widget-content)，给它加个标记类
    if (vnode.dom && vnode.dom.parentNode) {
      vnode.dom.parentNode.classList.add('popular-tags-wrapper-fix');
    }
    
    // [性能优化]
    // 1. sort=-discussionCount: 让数据库直接返回最热门的标签，而不是获取随机20个在前端排序。
    // 2. page[limit]: 获取稍微多一点的数据（比如显示数量的3倍），以便我们有足够的余量来过滤掉被隐藏的标签。
    //    如果用户隐藏了前3个，我们依然有足够的后续标签来填补空缺。
    const fetchLimit = showedTags * 3; 
    const url = app.forum.attribute('baseUrl') + `/api/tags?sort=-discussionCount&page[limit]=${fetchLimit}`;

    getTags(url).then((res) => {
      // [新功能] 核心过滤逻辑
      // 过滤掉当前用户设为 'hide' (隐藏) 的标签
      // 如果没安装 fof/follow-tags，subscription 为 undefined，不会报错
      const visibleTags = res.filter((tag) => {
        return tag.attributes.subscription !== 'hide';
      });

      // 截取用户设置的显示数量
      this.popularTags = visibleTags.slice(0, showedTags);
      
      this.loading = false;
      m.redraw();
    });
  }

  className() {
    return 'popular-tags';
  }

  icon() {
    return 'fas fa-tags';
  }

  title() {
    return app.translator.trans('justoverclock-popular-tags.forum.widgetTitle');
  }

  content() {
    if (this.loading) {
      return <LoadingIndicator />;
    }
    return (
      <div className="popular-tags">
        <ul className="poptag-ul">
          {this.popularTags &&
            this.popularTags.map((tag) => {
              // 使用 app.route.tag 生成链接是更标准的 Flarum 做法，
              // 但为了保持原插件逻辑，我们维持原样，只修复潜在的 slug 拼接问题
              const baseUrl = app.forum.attribute('baseUrl');
              const discussionCount = app.translator.trans('justoverclock-popular-tags.forum.count') + tag.attributes.discussionCount;
              
              return (
                <Link href={baseUrl + '/t/' + tag.attributes.slug} className="popular-tags-link">
                  <li className="poptag-li" title={discussionCount}>
                    {tag.attributes.name}
                  </li>
                </Link>
              );
            })}
        </ul>
      </div>
    );
  }
}
