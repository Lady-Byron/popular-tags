import Widget from 'flarum/extensions/afrux-forum-widgets-core/common/components/Widget';
import app from 'flarum/forum/app';
import getTags from '../helpers/getTags';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Link from 'flarum/common/components/Link';

export default class MyWidget extends Widget {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = true;
  }

  oncreate(vnode) {
    super.oncreate(vnode);
    const showedTags = app.forum.attribute('justoverclock-popular-tags.numberOfTags') || 4;
    const url = app.forum.attribute('baseUrl') + '/api/tags';
    getTags(url).then((res) => {
      this.popularTags = res.slice(0, showedTags);
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
