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

    // [修复虚化]：给父容器加标记，以便在 CSS 中移除遮罩
    if (vnode.dom && vnode.dom.parentNode) {
      vnode.dom.parentNode.classList.add('popular-tags-wrapper-fix');
    }
    
    const showedTags = app.forum.attribute('justoverclock-popular-tags.numberOfTags') || 4;
    
    // 性能优化：
    // 1. 直接让 API 按热门程度排序 (sort=-discussionCount)
    // 2. 多取 3 倍的数据，防止因用户屏蔽导致显示数量不足
    const fetchLimit = showedTags * 3;
    const url = app.forum.attribute('baseUrl') + `/api/tags?sort=-discussionCount&page[limit]=${fetchLimit}`;

    getTags(url).then((res) => {
      // 核心功能：过滤掉 "hide" 状态的标签
      const visibleTags = res.filter((tag) => {
        return tag.attributes.subscription !== 'hide';
      });

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
